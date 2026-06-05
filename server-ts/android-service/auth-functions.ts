import path from "path";
import { v4 as uuidv4 } from "uuid";
import moment, { Duration } from "moment-timezone";
import jwt from "jsonwebtoken";
import { Request } from "express";
import {
    ejsRender,
    buildroot,
    timezone,
    calcPeriod,
    defaultAccess,
    ENV,
    androidAccessTokenExpiry,
    refreshTokenExpiry,
    issuer,
    CustomError,
    getDevice,
    getCurrentTime
} from "../helpers/utils";
import {
    JwtPayload,
    GoogleProfileInfo,
    NodemailerOptions,
    ActiveSession
} from "../helpers/interfaces";
import { sendEmail } from "../nodemailer-service";
import { UserSchema } from "../helpers/schema";
import { MongoStudioHandler } from "../helpers/mongodb-connection";
import { ObjectId } from "mongodb";



const __notifyAdmin = async (googleAccount: GoogleProfileInfo, type: String) => { // type [signup,getin]

    try {

        const data: string = await ejsRender(
            path.join(process.cwd(), buildroot, "views", "newsignup.ejs"),
            {
                username: googleAccount.name,
                email: googleAccount.email,
                picture: googleAccount.picture
            }
        );

        const options: NodemailerOptions = {
            to: "toriumcar@gmail.com",
            subject: type === "signup" ? "New Sign-Up" : type === "getin" ? "Got Into Player" : "Just Logged In",
            html: data
        };

        sendEmail(options).catch(e => {});

    }
    catch(e) {}

};

const __notifyUser = async (user: UserSchema, type: String) => {

    try {

        const { duration, timeLimit } = user.accountAccess;
        const now = moment().tz(timezone);
        let diff: Duration;
        if (timeLimit) {
            diff = moment.duration(moment(timeLimit).diff(moment(now)));
        }
        else {
            const newdate = moment(now).add(duration,"s").tz(timezone);
            diff = moment.duration(moment(newdate).diff(moment(now).tz(timezone)));
        }

        const period = calcPeriod(diff);

        const data = await ejsRender(
            type === "signup" ?
            path.join(process.cwd(), buildroot, "views", "newsignup_user.ejs") :
            path.join(process.cwd(), buildroot, "views", "login_user.ejs"),
            { 
                period,
                // date,
                // time
            }
        );

        const options = {
            to: user.googleAccount.email,
            subject: type === "signup" ? "You just signed up!" : "You just logged in!",
            html: data
        };

        try {
            await sendEmail(options);
        } catch(e) {
            console.log("email",e);
        }

    } catch(e) {
        console.log("e",e);
        return false;
    }

};


export const accountCheck = async (request: Request) => {

    const { Users } = MongoStudioHandler.getCollectionSet();

    const { name, email, id, photoUrl }: any = request.body;

    let user = await Users.findOne({
        "email.id": email
    }) as UserSchema | null;

    const sessionId: string = uuidv4();

    if (user) {

        const { activeSessions = [] } = user;

        activeSessions.unshift({
            seen: false,
            device: getDevice(request),
            sessionId,
            lastUsed: getCurrentTime()
        });

        Object.assign(user, {
            googleAccount: {
                ...user.googleAccount,
                sub: id,
                name,
                email,
                picture: photoUrl
            },
            activeSessions: activeSessions.slice(0, 5)
        });

        await Users.updateOne(
            { _id: new ObjectId(user._id) },
            { $set: user }
        );

        __notifyAdmin(user.googleAccount, "login");
        if (user.accountAccess.type !== "expired") __notifyUser(user, "login");

    }
    else {

        //signup

        const new_user: UserSchema = {
            _id: new ObjectId(),
            username: null,
            accountAccess: {
                type: "allowed",
                duration: defaultAccess,
                timeLimit: null
            },
            email: {
                id: email,
                verificationStatus: "verified"
            },
            googleAccount: {
                exists: true,
                sub: id,
                name,
                email,
                email_verified: true,
                picture: photoUrl
            },
            loggedIn: "signed up",
            status: "active",
            activeSessions: [{
                seen: false,
                device: getDevice(request),
                sessionId,
                lastUsed: getCurrentTime()
            }],
            password: {
                key: ""
            },
            recentsLastModified: null,
            recentlyPlayed: [],
            installedVersion: null
        };

        await Users.insertOne(new_user);

        user = await Users.findOne({
            _id: new ObjectId(new_user._id)
        }) as UserSchema;

        __notifyAdmin(user.googleAccount, "signup");
        __notifyUser(user, "signup");

    }

    const payload: JwtPayload = {
        _id: String(user._id),
        email,
        sessionId
    };

    const accessToken: string = jwt.sign(payload, ENV().ACCESS_TOKEN_SECRET, { expiresIn: androidAccessTokenExpiry, issuer });
    const refreshToken: string = jwt.sign(payload, ENV().REFRESH_TOKEN_SECRET, { expiresIn: refreshTokenExpiry, issuer });

    console.log("return", {
        _id: user._id,
        name,
        email,
        picture: photoUrl,
        accessToken,
        refreshToken
    });

    return {
        _id: user._id,
        name,
        email,
        picture: photoUrl,
        accessToken,
        refreshToken
    };

};

export const accessCheck = async (request: Request) => {

    const { Users } = MongoStudioHandler.getCollectionSet();

    const { user_id = null }: any = request.body;
    const { sessionId = null } = request.result;

    const user = await Users.findOne({
        _id: new ObjectId(user_id)
    }) as UserSchema | null;

    if (!user) return {};

    const { accountAccess, googleAccount, username, _id, activeSessions = [] } = user;
    const { name, picture, email } = googleAccount;
    const { timeLimit, duration, type } = accountAccess;

    const curSession: ActiveSession|undefined = activeSessions.find(each => {
        return each.sessionId === sessionId;
    });

    const { seen = false } = curSession || {};

    // type [revoked, expired, signup, login]

    if (type === "revoked") {
        return {
            type: "revoked",
            period: null,
            user: { name: username || name, picture, email, _id },
            seen: null
        };
    }

    const [diff, secs] = (() => {

        if (seen) {
            const diff = moment.duration(moment(timeLimit).diff(moment().tz(timezone)));
            const secs = Math.floor(diff.asSeconds());
            return [diff, secs];
        }
        else {
            const now = moment().tz(timezone);
            let diff: Duration;
            if (timeLimit) {
                diff = moment.duration(moment(timeLimit).diff(moment(now)));
            }
            else {
                const newdate = moment(now).add(duration,"s").tz(timezone);
                diff = moment.duration(moment(newdate).diff(moment(now).tz(timezone)));
            }
            const secs = diff.asSeconds();
            return [diff, secs];
        }

    })();

    if (secs <= 30) {
        return {
            type: "expired",
            period: null,
            user: { name: username || name, picture, email, _id },
            seen: null
        };
    }

    if (!user.username) {
        return {
            type: "signup",
            period: calcPeriod(diff),
            user: { name: username || name, picture, email, _id },
            seen
        };
    }

    return {
        type: "login",
        period: calcPeriod(diff),
        user: { name: username || name, picture, email, _id },
        seen
    };

};

export const signOut = async (request: Request) => {

    const { Users } = MongoStudioHandler.getCollectionSet();

    const { user_id } = request.body;
    const { sessionId = null } = request.result;

    const user = await Users.findOne({
        _id: new ObjectId(user_id)
    }) as UserSchema | null;

    if (!user) throw new CustomError("user not found!", { user });

    const { activeSessions = [] } = user;

    Object.assign(user, {
        activeSessions: activeSessions.filter(each => {
            return each.sessionId !== sessionId;
        })
    });

    await Users.updateOne(
        { _id: new ObjectId(user._id) },
        { $set: user }
    );

    return null;

};

export const continueLoginIn = async (request: Request) => {

    const { Users } = MongoStudioHandler.getCollectionSet();

    const { username = null, user_id }: { username: string|null, user_id: string } = request.body;
    const { sessionId = null } = request.result;

    const user = await Users.findOne({
        _id: new ObjectId(user_id)
    }) as UserSchema | null;

    if (!user) throw new CustomError("user not found!", { user });

    const { accountAccess, activeSessions = [] } = user;

    for (let i=0; i<activeSessions.length; i++) {
        const { sessionId: curSessionId } = activeSessions[i];
        if (curSessionId !== sessionId) continue;
        Object.assign(activeSessions[i], {
            seen: true
        });
        break;
    }

    Object.assign(user, {
        username: username === null ? user.username : username,
        loggedIn: "logged in",
        accountAccess: {
            ...accountAccess,
            timeLimit: accountAccess.timeLimit || moment().tz(timezone).add(accountAccess.duration,"s").toDate()
        }
    });

    await Users.updateOne(
        { _id: new ObjectId(user._id) },
        { $set: user }
    );

    __notifyAdmin(user.googleAccount, "getin");

    return { success: true };

};

export const requestAccess = async (request: Request, _:any) => {

    const { Users } = MongoStudioHandler.getCollectionSet();

    const { id = null } = request.ACCOUNT;

    const user = await Users.findOne({
        _id: id ? new ObjectId(id) : undefined
    }) as UserSchema | null;

    if (!user) return { requestSent: false };

    const { googleAccount } = user;

    try {

        const data = await ejsRender(
            path.join(process.cwd(), buildroot, "views", "newsignup.ejs"),
            {
                username: googleAccount.name,
                email: googleAccount.email,
                picture: googleAccount.picture
            }
        );

        const options = {
            to: "toriumcar@gmail.com",
            subject: "Request More Time",
            html: data
        };

        return sendEmail(options)
            .then(() => {
                return { requestSent: true };
            })
            .catch(e => {
                return { requestSent: false };
            });

    } catch(e) {
        return { requestSent: false };
    }

};
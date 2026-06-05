"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestAccess = exports.continueLoginIn = exports.signOut = exports.accessCheck = exports.accountCheck = void 0;
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const utils_1 = require("../helpers/utils");
const nodemailer_service_1 = require("../nodemailer-service");
const mongodb_connection_1 = require("../helpers/mongodb-connection");
const mongodb_1 = require("mongodb");
const __notifyAdmin = async (googleAccount, type) => {
    try {
        const data = await (0, utils_1.ejsRender)(path_1.default.join(process.cwd(), utils_1.buildroot, "views", "newsignup.ejs"), {
            username: googleAccount.name,
            email: googleAccount.email,
            picture: googleAccount.picture
        });
        const options = {
            to: "toriumcar@gmail.com",
            subject: type === "signup" ? "New Sign-Up" : type === "getin" ? "Got Into Player" : "Just Logged In",
            html: data
        };
        (0, nodemailer_service_1.sendEmail)(options).catch(e => { });
    }
    catch (e) { }
};
const __notifyUser = async (user, type) => {
    try {
        const { duration, timeLimit } = user.accountAccess;
        const now = (0, moment_timezone_1.default)().tz(utils_1.timezone);
        let diff;
        if (timeLimit) {
            diff = moment_timezone_1.default.duration((0, moment_timezone_1.default)(timeLimit).diff((0, moment_timezone_1.default)(now)));
        }
        else {
            const newdate = (0, moment_timezone_1.default)(now).add(duration, "s").tz(utils_1.timezone);
            diff = moment_timezone_1.default.duration((0, moment_timezone_1.default)(newdate).diff((0, moment_timezone_1.default)(now).tz(utils_1.timezone)));
        }
        const period = (0, utils_1.calcPeriod)(diff);
        const data = await (0, utils_1.ejsRender)(type === "signup" ?
            path_1.default.join(process.cwd(), utils_1.buildroot, "views", "newsignup_user.ejs") :
            path_1.default.join(process.cwd(), utils_1.buildroot, "views", "login_user.ejs"), {
            period,
            // date,
            // time
        });
        const options = {
            to: user.googleAccount.email,
            subject: type === "signup" ? "You just signed up!" : "You just logged in!",
            html: data
        };
        try {
            await (0, nodemailer_service_1.sendEmail)(options);
        }
        catch (e) {
            console.log("email", e);
        }
    }
    catch (e) {
        console.log("e", e);
        return false;
    }
};
const accountCheck = async (request) => {
    const { Users } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const { name, email, id, photoUrl } = request.body;
    let user = await Users.findOne({
        "email.id": email
    });
    const sessionId = (0, uuid_1.v4)();
    if (user) {
        const { activeSessions = [] } = user;
        activeSessions.unshift({
            seen: false,
            device: (0, utils_1.getDevice)(request),
            sessionId,
            lastUsed: (0, utils_1.getCurrentTime)()
        });
        Object.assign(user, {
            googleAccount: Object.assign(Object.assign({}, user.googleAccount), { sub: id, name,
                email, picture: photoUrl }),
            activeSessions: activeSessions.slice(0, 5)
        });
        await Users.updateOne({ _id: new mongodb_1.ObjectId(user._id) }, { $set: user });
        __notifyAdmin(user.googleAccount, "login");
        if (user.accountAccess.type !== "expired")
            __notifyUser(user, "login");
    }
    else {
        //signup
        const new_user = {
            _id: new mongodb_1.ObjectId(),
            username: null,
            accountAccess: {
                type: "allowed",
                duration: utils_1.defaultAccess,
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
                    device: (0, utils_1.getDevice)(request),
                    sessionId,
                    lastUsed: (0, utils_1.getCurrentTime)()
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
            _id: new mongodb_1.ObjectId(new_user._id)
        });
        __notifyAdmin(user.googleAccount, "signup");
        __notifyUser(user, "signup");
    }
    const payload = {
        _id: String(user._id),
        email,
        sessionId
    };
    const accessToken = jsonwebtoken_1.default.sign(payload, (0, utils_1.ENV)().ACCESS_TOKEN_SECRET, { expiresIn: utils_1.androidAccessTokenExpiry, issuer: utils_1.issuer });
    const refreshToken = jsonwebtoken_1.default.sign(payload, (0, utils_1.ENV)().REFRESH_TOKEN_SECRET, { expiresIn: utils_1.refreshTokenExpiry, issuer: utils_1.issuer });
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
exports.accountCheck = accountCheck;
const accessCheck = async (request) => {
    const { Users } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const { user_id = null } = request.body;
    const { sessionId = null } = request.result;
    const user = await Users.findOne({
        _id: new mongodb_1.ObjectId(user_id)
    });
    if (!user)
        return {};
    const { accountAccess, googleAccount, username, _id, activeSessions = [] } = user;
    const { name, picture, email } = googleAccount;
    const { timeLimit, duration, type } = accountAccess;
    const curSession = activeSessions.find(each => {
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
            const diff = moment_timezone_1.default.duration((0, moment_timezone_1.default)(timeLimit).diff((0, moment_timezone_1.default)().tz(utils_1.timezone)));
            const secs = Math.floor(diff.asSeconds());
            return [diff, secs];
        }
        else {
            const now = (0, moment_timezone_1.default)().tz(utils_1.timezone);
            let diff;
            if (timeLimit) {
                diff = moment_timezone_1.default.duration((0, moment_timezone_1.default)(timeLimit).diff((0, moment_timezone_1.default)(now)));
            }
            else {
                const newdate = (0, moment_timezone_1.default)(now).add(duration, "s").tz(utils_1.timezone);
                diff = moment_timezone_1.default.duration((0, moment_timezone_1.default)(newdate).diff((0, moment_timezone_1.default)(now).tz(utils_1.timezone)));
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
            period: (0, utils_1.calcPeriod)(diff),
            user: { name: username || name, picture, email, _id },
            seen
        };
    }
    return {
        type: "login",
        period: (0, utils_1.calcPeriod)(diff),
        user: { name: username || name, picture, email, _id },
        seen
    };
};
exports.accessCheck = accessCheck;
const signOut = async (request) => {
    const { Users } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const { user_id } = request.body;
    const { sessionId = null } = request.result;
    const user = await Users.findOne({
        _id: new mongodb_1.ObjectId(user_id)
    });
    if (!user)
        throw new utils_1.CustomError("user not found!", { user });
    const { activeSessions = [] } = user;
    Object.assign(user, {
        activeSessions: activeSessions.filter(each => {
            return each.sessionId !== sessionId;
        })
    });
    await Users.updateOne({ _id: new mongodb_1.ObjectId(user._id) }, { $set: user });
    return null;
};
exports.signOut = signOut;
const continueLoginIn = async (request) => {
    const { Users } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const { username = null, user_id } = request.body;
    const { sessionId = null } = request.result;
    const user = await Users.findOne({
        _id: new mongodb_1.ObjectId(user_id)
    });
    if (!user)
        throw new utils_1.CustomError("user not found!", { user });
    const { accountAccess, activeSessions = [] } = user;
    for (let i = 0; i < activeSessions.length; i++) {
        const { sessionId: curSessionId } = activeSessions[i];
        if (curSessionId !== sessionId)
            continue;
        Object.assign(activeSessions[i], {
            seen: true
        });
        break;
    }
    Object.assign(user, {
        username: username === null ? user.username : username,
        loggedIn: "logged in",
        accountAccess: Object.assign(Object.assign({}, accountAccess), { timeLimit: accountAccess.timeLimit || (0, moment_timezone_1.default)().tz(utils_1.timezone).add(accountAccess.duration, "s").toDate() })
    });
    await Users.updateOne({ _id: new mongodb_1.ObjectId(user._id) }, { $set: user });
    __notifyAdmin(user.googleAccount, "getin");
    return { success: true };
};
exports.continueLoginIn = continueLoginIn;
const requestAccess = async (request, _) => {
    const { Users } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const { id = null } = request.ACCOUNT;
    const user = await Users.findOne({
        _id: id ? new mongodb_1.ObjectId(id) : undefined
    });
    if (!user)
        return { requestSent: false };
    const { googleAccount } = user;
    try {
        const data = await (0, utils_1.ejsRender)(path_1.default.join(process.cwd(), utils_1.buildroot, "views", "newsignup.ejs"), {
            username: googleAccount.name,
            email: googleAccount.email,
            picture: googleAccount.picture
        });
        const options = {
            to: "toriumcar@gmail.com",
            subject: "Request More Time",
            html: data
        };
        return (0, nodemailer_service_1.sendEmail)(options)
            .then(() => {
            return { requestSent: true };
        })
            .catch(e => {
            return { requestSent: false };
        });
    }
    catch (e) {
        return { requestSent: false };
    }
};
exports.requestAccess = requestAccess;
//# sourceMappingURL=auth-functions.js.map
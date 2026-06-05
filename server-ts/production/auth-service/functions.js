"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.androidApiAccessCheck = exports.androidApiAuthCheck = exports.signOut = exports.continueAuthSignin = exports.oauthCheck = exports.rootAccessCheck = exports.rootAuthCheck = exports.apiAccessCheck = exports.apiAuthCheck = exports.servertypes = exports.requestAccess = exports.googleAuthCheck = void 0;
const uuid_1 = require("uuid");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const utils_1 = require("../helpers/utils");
const nodemailer_service_1 = require("../nodemailer-service");
const mongodb_1 = require("mongodb");
const mongodb_connection_1 = require("../helpers/mongodb-connection");
;
const __verifyAccessToken = async (token) => {
    const { Users } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const obj = jsonwebtoken_1.default.verify(token, (0, utils_1.ENV)().ACCESS_TOKEN_SECRET);
    const { _id, sessionId = null } = obj;
    if (sessionId === null)
        return { found: false, id: null, user: null };
    const user = await Users.findOne({
        _id: new mongodb_1.ObjectId(_id)
    });
    if (!user)
        return { found: false, id: null, user: null };
    const index = user.activeSessions.findIndex(each => {
        return each.sessionId === sessionId;
    });
    if (index < 0)
        return { found: false, id: null, user: null };
    return { found: true, id: _id, user, sessionId };
};
const __generateAccessToken = async (token) => {
    const { Users } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(token, (0, utils_1.ENV)().REFRESH_TOKEN_SECRET);
    }
    catch (e) {
        throw e;
    }
    const user = await Users.findOne({
        _id: new mongodb_1.ObjectId(payload._id)
    });
    if (!user)
        return { accessToken: null, id: null };
    const newPayLoad = {
        _id: String(user._id),
        email: user.googleAccount.email,
        sessionId: payload.sessionId
    };
    const accessToken = jsonwebtoken_1.default.sign(newPayLoad, (0, utils_1.ENV)().ACCESS_TOKEN_SECRET, { expiresIn: utils_1.accessTokenExpiry, issuer: utils_1.issuer });
    return { accessToken, id: String(user._id) };
};
const __refreshAccessToken = async (request) => {
    const cookieObj = (0, utils_1.cookieParser)(request);
    const refreshToken = cookieObj.ACCOUNT_REFRESH;
    if (!refreshToken)
        return { accessToken: null, id: null };
    return await __generateAccessToken(refreshToken);
};
const __cookieFound = async (request) => {
    const cookieObj = (0, utils_1.cookieParser)(request);
    const token = cookieObj.ACCOUNT;
    if (!token)
        return { found: false, id: null, user: null };
    return await __verifyAccessToken(token);
};
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
const __setExpired = async (userId) => {
    const { Users } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const update = await Users.updateOne({ _id: new mongodb_1.ObjectId(userId) }, { "accountAccess.type": "expired" });
};
const googleAuthCheck = async (request, response, next) => {
    var _a;
    const { Users } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const { sub, name, picture, email, email_verified } = (_a = request.user) === null || _a === void 0 ? void 0 : _a._json;
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
            googleAccount: Object.assign(Object.assign({}, user.googleAccount), { sub,
                name,
                email,
                picture }),
            activeSessions: activeSessions.slice(0, 5)
        });
        await Users.updateOne({ _id: new mongodb_1.ObjectId(user._id) }, { $set: user });
        response.user = {
            _id: String(user._id || ""),
            error: false
        };
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
                verificationStatus: email_verified ? "verified" : "pending"
            },
            googleAccount: { exists: true, sub, name, email, email_verified, picture },
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
        response.user = {
            _id: String((user === null || user === void 0 ? void 0 : user._id) || ""),
            error: false
        };
        console.log("response", response.user);
        __notifyAdmin(user.googleAccount, "signup");
        __notifyUser(user, "signup");
    }
    const payload = {
        _id: String(user._id),
        email,
        sessionId
    };
    const accessToken = jsonwebtoken_1.default.sign(payload, (0, utils_1.ENV)().ACCESS_TOKEN_SECRET, { expiresIn: utils_1.accessTokenExpiry, issuer: utils_1.issuer });
    const refreshToken = jsonwebtoken_1.default.sign(payload, (0, utils_1.ENV)().REFRESH_TOKEN_SECRET, { expiresIn: utils_1.refreshTokenExpiry, issuer: utils_1.issuer });
    response.cookie("ACCOUNT", accessToken, utils_1.standardCookieConfig);
    response.cookie("ACCOUNT_REFRESH", refreshToken, utils_1.standardCookieConfig);
    return next();
};
exports.googleAuthCheck = googleAuthCheck;
const requestAccess = async (request, _) => {
    const { userId } = request.query;
    const { found, user: userFromCookie } = await __cookieFound(request);
    if (!found || !userFromCookie)
        return { error: true };
    if (String(userFromCookie._id) !== userId)
        return { error: true };
    const { googleAccount } = userFromCookie;
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
const servertypes = (_, _1) => {
    return utils_1.server;
};
exports.servertypes = servertypes;
const apiAuthCheck = async (request, response, next) => {
    try {
        const result = await __cookieFound(request);
        if (result.found) {
            request.result = result;
            request.ACCOUNT = { id: result.id || "" };
            return next();
        }
        else {
            return response.status(200).send({ redirect: true, to: utils_1.MAIN_URL + "/" });
        }
    }
    catch (e) {
        if (e instanceof Error && e.name === "TokenExpiredError") {
            try {
                const result = await __refreshAccessToken(request);
                request.result = result;
                if (result.accessToken) {
                    response.cookie("ACCOUNT", result.accessToken, utils_1.standardCookieConfig);
                    request.ACCOUNT = { id: result.id || "" };
                    return next();
                }
                else {
                    return response.status(200).send({ redirect: true, to: utils_1.MAIN_URL + "/" });
                }
            }
            catch (e) {
                return response.status(200).send({ redirect: true, to: utils_1.MAIN_URL + "/" });
            }
        }
        return response.status(200).send({ redirect: true, to: utils_1.MAIN_URL + "/" });
    }
};
exports.apiAuthCheck = apiAuthCheck;
const apiAccessCheck = async (request, response, next) => {
    const { Users } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const { result } = request;
    const { found, id, user, sessionId = null } = result;
    if (!found)
        return next();
    if (!id || !user)
        return next();
    const { accountAccess, activeSessions = [] } = user;
    const { timeLimit, type } = accountAccess;
    const curSession = activeSessions.find(each => {
        return each.sessionId === sessionId;
    });
    const { seen = false } = curSession || {};
    Object.assign(user, {
        activeSessions: activeSessions.map(each => {
            if (each.sessionId !== sessionId)
                return each;
            each.lastUsed = (0, utils_1.getCurrentTime)();
            return each;
        })
    });
    await Users.updateOne({ _id: new mongodb_1.ObjectId(user._id) }, { $set: user });
    if (type === "under_review" || type === "revoked" || !seen) {
        // const uid = await __uidToRedirect(user._id);
        return response.status(200).send({ redirect: true, to: `${utils_1.MAIN_URL}/google-oauth-signin/${id}` });
    }
    const diff = moment_timezone_1.default.duration((0, moment_timezone_1.default)(timeLimit).diff((0, moment_timezone_1.default)().tz(utils_1.timezone)));
    const secs = diff.asSeconds();
    if (secs <= 30) {
        // const uid = await __uidToRedirect(user._id);
        __setExpired(id);
        return response.status(200).send({ redirect: true, to: `${utils_1.MAIN_URL}/google-oauth-signin/${id}` });
    }
    else
        return next();
};
exports.apiAccessCheck = apiAccessCheck;
const rootAuthCheck = async (request, response, next) => {
    try {
        request.result = await __cookieFound(request);
    }
    catch (e) {
        if (e instanceof Error && e.name === "TokenExpiredError") {
            try {
                const result = await __refreshAccessToken(request);
                if (result.accessToken) {
                    response.cookie("ACCOUNT", result.accessToken, utils_1.standardCookieConfig);
                    request.result = { found: true, id: null, user: null };
                }
                else {
                    request.result = { found: false, id: null, user: null };
                }
            }
            catch (e) {
                request.result = { found: true, id: null, user: null };
            }
        }
        else {
            request.result = { found: true, id: null, user: null };
        }
    }
    finally {
        next();
    }
};
exports.rootAuthCheck = rootAuthCheck;
const rootAccessCheck = async (request, response, next) => {
    const { result } = request;
    const { found, id, user, sessionId = null } = result;
    let shouldRedirect = false;
    if (!found)
        return next();
    if (!id || !user)
        return next();
    const { accountAccess, activeSessions = [] } = user;
    const { timeLimit, type } = accountAccess;
    const curSession = activeSessions.find(each => {
        return each.sessionId === sessionId;
    });
    const { seen = false } = curSession || {};
    if (type === "under_review" || type === "revoked" || !seen)
        shouldRedirect = true;
    const diff = moment_timezone_1.default.duration((0, moment_timezone_1.default)(timeLimit).diff((0, moment_timezone_1.default)().tz(utils_1.timezone)));
    const secs = diff.asSeconds();
    if (secs <= 30) {
        __setExpired(id);
        shouldRedirect = true;
    }
    if (shouldRedirect) {
        (0, utils_1.setRedirectUriCookie)(request.path, response);
        return response.redirect(`${utils_1.MAIN_URL}/google-oauth-signin/${id}`);
    }
    return next();
};
exports.rootAccessCheck = rootAccessCheck;
const oauthCheck = async (request, _) => {
    const { Users } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const { userId } = request.body;
    const { found, user: userFromCookie, sessionId = null } = await __cookieFound(request);
    if (!found || !userFromCookie)
        return { error: true };
    if (String(userFromCookie._id) !== userId)
        return { error: true };
    const user = await Users.findOne({
        _id: new mongodb_1.ObjectId(userId)
    });
    if (!user)
        return { error: true };
    const { accountAccess, googleAccount, username, _id, loggedIn, activeSessions = [] } = user;
    const { name, picture, email } = googleAccount;
    const { timeLimit, duration, type } = accountAccess;
    const curSession = activeSessions.find(each => {
        return each.sessionId === sessionId;
    });
    const { seen = false } = curSession || {};
    // await Object.assign(user, { accountAccess }).save();
    if (type === "under_review") {
        return {
            status: 404,
            type: "under_review",
            user: { name: username || name, picture, email, _id }
        };
    }
    if (type === "revoked") {
        return {
            status: 404,
            type: "revoked",
            user: { name: username || name, picture, email, _id }
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
            status: 404,
            type: "expired",
            request_button: true,
            user: { name: username || name, picture, email, _id }
        };
    }
    if (!user.username) {
        return {
            // status: 400,
            set_username: true,
            period: (0, utils_1.calcPeriod)(diff),
            user: { name: username || name, picture, email, _id },
            newSignUp: loggedIn === "signed up"
        };
    }
    else {
        return {
            // status: 400,
            only_button: true,
            period: (0, utils_1.calcPeriod)(diff),
            user: { name: username || name, picture, email, _id },
            newSignUp: loggedIn === "signed up"
        };
    }
};
exports.oauthCheck = oauthCheck;
const continueAuthSignin = async (request, response) => {
    const { Users } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const { username, userId } = request.body;
    const { found, user: userFromCookie, sessionId = null } = await __cookieFound(request);
    if (!found || !userFromCookie)
        return { error: true };
    if (String(userFromCookie._id) !== userId)
        return { error: true };
    const user = await Users.findOne({
        _id: new mongodb_1.ObjectId(userId)
    });
    if (!user)
        return { error: true };
    const { googleAccount, activeSessions = [] } = user;
    let { accountAccess } = user;
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
        username: username !== "" ? username : user.username,
        loggedIn: "logged in",
        accountAccess: Object.assign(Object.assign({}, accountAccess), { timeLimit: accountAccess.timeLimit || (0, moment_timezone_1.default)().tz(utils_1.timezone).add(accountAccess.duration, "s").toDate() }),
        activeSessions
    });
    await Users.updateOne({ _id: new mongodb_1.ObjectId(user._id) }, { $set: user });
    const redirectUri = (0, utils_1.checkRedirectUri)(request);
    if (redirectUri !== null)
        response.clearCookie("REDIRECT_URI", utils_1.redirectUriCookieConfig);
    __notifyAdmin(user.googleAccount, "getin");
    return {
        success: true,
        username: user.username,
        userId: String(user._id),
        email: googleAccount.email,
        picture: googleAccount.picture,
        status: "loggedin",
        redirectUri: redirectUri || utils_1.PLAYER_URL
    };
};
exports.continueAuthSignin = continueAuthSignin;
const signOut = async (request, response) => {
    const { Users } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const { userId } = request.body;
    const { found, user: userFromCookie, sessionId = null } = await __cookieFound(request);
    if (!found || !userFromCookie)
        return { error: true };
    if (String(userFromCookie._id) !== userId)
        return { error: true };
    const user = await Users.findOne({
        _id: new mongodb_1.ObjectId(userId)
    });
    if (!user)
        return { success: false };
    const { activeSessions = [] } = user;
    Object.assign(user, {
        activeSessions: activeSessions.filter(each => {
            return each.sessionId !== sessionId;
        })
    });
    await Users.updateOne({ _id: new mongodb_1.ObjectId(user._id) }, { $set: user });
    response.clearCookie("ACCOUNT", utils_1.standardCookieConfig);
    response.clearCookie("ACCOUNT_REFRESH", utils_1.standardCookieConfig);
    return { success: true };
};
exports.signOut = signOut;
const androidApiAuthCheck = async (request, _, next) => {
    const { accesstoken = null } = request.headers;
    // access token error -> redirect to login page
    const err1 = new utils_1.CustomError(null, {
        middleware: true,
        status: "failed",
        errorType: 1
    });
    if (accesstoken === null)
        return next(err1);
    try {
        const result = await __verifyAccessToken(accesstoken);
        if (!result.found)
            return next(err1);
        request.result = result;
        request.ACCOUNT = { id: result.id || "" };
        return next();
    }
    catch (e) {
        return next(err1);
    }
};
exports.androidApiAuthCheck = androidApiAuthCheck;
const androidApiAccessCheck = async (request, _, next) => {
    const { Users } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const { result } = request;
    const { found, id, user, sessionId = null } = result;
    // access expired -> redirect to profile check page
    const err2 = new utils_1.CustomError(null, {
        middleware: true,
        status: "failed",
        errorType: 2
    });
    if (!found)
        return next();
    if (!id || !user)
        return next();
    const { accountAccess, activeSessions = [] } = user;
    const { timeLimit, type } = accountAccess;
    const curSession = activeSessions.find(each => {
        return each.sessionId === sessionId;
    });
    const { seen = false } = curSession || {};
    Object.assign(user, {
        activeSessions: activeSessions.map(each => {
            if (each.sessionId !== sessionId)
                return each;
            each.lastUsed = (0, utils_1.getCurrentTime)();
            return each;
        })
    });
    await Users.updateOne({ _id: new mongodb_1.ObjectId(user._id) }, { $set: user });
    if (type === "under_review" || type === "revoked" || !seen) {
        return next(err2);
    }
    const diff = moment_timezone_1.default.duration((0, moment_timezone_1.default)(timeLimit).diff((0, moment_timezone_1.default)().tz(utils_1.timezone)));
    const secs = diff.asSeconds();
    if (secs <= 30) {
        __setExpired(id);
        return next(err2);
    }
    return next();
};
exports.androidApiAccessCheck = androidApiAccessCheck;
//# sourceMappingURL=functions.js.map
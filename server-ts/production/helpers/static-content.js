"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = require("../helpers/middlewares");
const functions_1 = require("../auth-service/functions");
const utils_1 = require("../helpers/utils");
const passport_1 = __importDefault(require("passport"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
// google sign in
router.get("/google-signin", passport_1.default.authenticate("google", { failureRedirect: utils_1.MAIN_URL + "/login?status=failed", session: false }), functions_1.googleAuthCheck, (req, res, next) => {
    console.log("here");
    if (res.user.error) {
        return res.redirect(utils_1.MAIN_URL + "/login?status=success&email=exists");
    }
    return res.redirect(`${utils_1.MAIN_URL}/google-oauth-signin/${res.user._id}`);
});
// google auth
router.get("/google-oauth-signin/*", middlewares_1.userAgentCheck, (req, res, next) => {
    const file_path = path_1.default.join(process.cwd(), utils_1.buildroot, "main-build", "index.html");
    if (!fs_1.default.existsSync(file_path))
        return res.status(404).end();
    return res.status(200).sendFile(file_path);
});
// static assets file handler
router.get([
    "/mobile/assets/static/*",
    "/main/assets/static/*",
    "/player/assets/static/*"
], (req, res, next) => {
    const url = req.path;
    const url_split = url.split("/");
    const folder_name = (() => {
        if (url.includes("/css"))
            return "css";
        if (url.includes("/js"))
            return "js";
        if (url.includes("/media"))
            return "media";
        return null;
    })();
    const build_name = (() => {
        if (url_split[1] === "mobile")
            return "mobile-build";
        if (url_split[1] === "main")
            return "main-build";
        if (url_split[1] === "player")
            return "player-build";
        return null;
    })();
    if (folder_name === null || build_name === null) {
        return res.status(404).end();
    }
    const file_path = path_1.default.join(process.cwd(), utils_1.buildroot, build_name, "static", folder_name, url_split[url_split.length - 1]);
    if (!fs_1.default.existsSync(file_path))
        return res.status(404).end();
    return res.status(200).sendFile(file_path);
});
// global assets file handler
router.get([
    "/mobile/assets/*",
    "/main/assets/*",
    "/player/assets/*"
], (req, res, next) => {
    const url_split = req.path.split("/");
    const file_path = path_1.default.join(process.cwd(), utils_1.buildroot, "player-build", url_split[url_split.length - 1]);
    if (!fs_1.default.existsSync(file_path))
        return res.status(404).end();
    return res.status(200).sendFile(file_path);
});
// index html
router.get("/", middlewares_1.userAgentCheck, (req, res, next) => {
    const file_path = req.headers.host === "player.studiomusic.app" ?
        path_1.default.join(process.cwd(), utils_1.buildroot, "player-build", "index.html") :
        path_1.default.join(process.cwd(), utils_1.buildroot, "main-build", "index.html");
    if (!fs_1.default.existsSync(file_path))
        return res.status(404).end();
    return res.status(200).sendFile(file_path);
});
// player index html
router.get([
    "/search",
    "/album/:albumId",
    "/album/:albumId/playable",
    "/track/:albumId/:trackId",
    "/track/:albumId/:trackId/playable"
], (req, res, next) => {
    if (req.headers.host !== "player.studiomusic.app") {
        return res.status(404).end();
    }
    return next();
}, middlewares_1.userAgentCheck, functions_1.rootAuthCheck, functions_1.rootAccessCheck, async (req, res, next) => {
    const { result } = req;
    // if (!result.found) {
    //     setRedirectUriCookie(req.url, res);
    //     return res.redirect("/");
    // }
    // const file_path = path.join(process.cwd(), buildroot, "player-build", "index.html");
    // if (!fs.existsSync(file_path)) return res.status(404).end();
    // return res.status(200).sendFile(file_path);
    const url = new URL(req.url, `https://${req.headers.host}`);
    if (req.path.includes("/album") ||
        req.path.includes("/track")) {
        if (!result.found)
            (0, utils_1.setRedirectUriCookie)(url.href, res);
        const data = await (0, middlewares_1.updateHtmlHead)(req);
        return res.status(200).send(data);
    }
    else {
        if (!result.found) {
            (0, utils_1.setRedirectUriCookie)(url.href, res);
            return res.redirect(utils_1.MAIN_URL);
        }
        const file_path = path_1.default.join(process.cwd(), utils_1.buildroot, "player-build", "index.html");
        if (!fs_1.default.existsSync(file_path))
            return res.status(404).end();
        return res.status(200).sendFile(file_path);
    }
});
// mobile index html
router.get("/mobileview", (req, res, next) => {
    const file_path = path_1.default.join(process.cwd(), utils_1.buildroot, "mobile-build", "index.html");
    if (!fs_1.default.existsSync(file_path))
        return res.status(404).end();
    return res.status(200).sendFile(file_path);
});
// anything else
router.get("/*", (req, res, next) => {
    if (req.headers.host === "player.studiomusic.app") {
        return res.redirect(utils_1.PLAYER_URL);
    }
    return res.redirect(utils_1.MAIN_URL);
});
exports.default = router;
//# sourceMappingURL=static-content.js.map
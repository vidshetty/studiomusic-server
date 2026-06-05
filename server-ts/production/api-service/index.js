"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const functions_1 = require("../auth-service/functions");
const responsehandler_1 = require("../helpers/responsehandler");
const functions_2 = require("./functions");
const utils_1 = require("../helpers/utils");
const router = (0, express_1.Router)();
router.get("/getLatestUpdate", (0, responsehandler_1.responseMid)(functions_2.getLatestUpdate));
router.get("/link/:id/:linkType", functions_2.getOriginalResumeLink);
router.get("/links/demo-videos", functions_2.demoVideosLink);
router.post("/send-email", (0, responsehandler_1.responseMid)(functions_2.sendEmailApi));
router.use(functions_1.apiAuthCheck);
router.get("/whosthis", (0, responsehandler_1.responseMid)(functions_2.getProfile));
router.use(functions_1.apiAccessCheck);
router.get("/activateCheck", (0, responsehandler_1.responseMid)(functions_2.activateCheck));
router.get("/recordTime", (0, responsehandler_1.responseMid)(functions_2.recordTime));
router.get("/getHomeAlbums", (0, responsehandler_1.responseMid)(functions_2.homeAlbums));
router.get("/getLibrary", (0, responsehandler_1.responseMid)(functions_2.getLibrary));
router.get("/getTrack", (0, responsehandler_1.responseMid)(functions_2.getTrackDetails));
router.get("/getAlbumDetails", (0, responsehandler_1.responseMid)(functions_2.getAlbumDetails));
router.get("/search", (0, responsehandler_1.responseMid)(functions_2.search));
router.post("/addToRecentlyPlayed", (0, responsehandler_1.responseMid)(functions_2.addToRecentlyPlayed));
router.get("/getLyrics", (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: (0, utils_1.ENV)().SERVER_GO_URL,
    changeOrigin: true,
    pathRewrite: (path, req) => {
        var _a;
        return "/lyrics?" + (((_a = String(req.originalUrl || "").split("?")) === null || _a === void 0 ? void 0 : _a[1]) || "");
    }
}));
router.get("/sign-out", (0, responsehandler_1.responseMid)(functions_2.signOut));
router.get("/startradio", (0, responsehandler_1.responseMid)(functions_2.startRadio));
router.get("/goToRedirect", (_, res) => res.redirect(utils_1.MAIN_URL + "/login"));
router.use("*", (_, response) => {
    return response.status(404).end();
});
exports.default = router;
//# sourceMappingURL=index.js.map
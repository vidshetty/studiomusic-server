"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const responsehandler_1 = require("../helpers/responsehandler");
const functions_1 = require("./functions");
const router = (0, express_1.Router)();
router.post("/sign-out", (0, responsehandler_1.responseMid)(functions_1.signOut));
router.post("/oauth-check", (0, responsehandler_1.responseMid)(functions_1.oauthCheck));
router.post("/continue-oauth-signin", (0, responsehandler_1.responseMid)(functions_1.continueAuthSignin));
router.get("/request-access", (0, responsehandler_1.responseMid)(functions_1.requestAccess));
router.get("/server-type", (0, responsehandler_1.responseMid)(functions_1.servertypes));
router.use("*", (_, response) => {
    return response.status(404).end();
});
exports.default = router;
//# sourceMappingURL=index.js.map
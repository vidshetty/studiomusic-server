"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const utils_1 = require("../helpers/utils");
const responsehandler_1 = require("../helpers/responsehandler");
const functions_1 = require("./functions");
const router = (0, express_1.Router)();
const accessCheck = (request, response, next) => {
    const auth = request.headers.authorization;
    if (auth !== (0, utils_1.ENV)().ADMIN_ACCESS) {
        return response.status(500).send({
            message: "Invalid admin access"
        });
    }
    return next();
};
router.use(accessCheck);
router.post("/update", (0, responsehandler_1.responseMid)(functions_1.update));
router.get("/getuser", (0, responsehandler_1.responseMid)(functions_1.getUser));
router.get("/album", (0, responsehandler_1.responseMid)(functions_1.getAlbum));
router.get("/albums", (0, responsehandler_1.responseMid)(functions_1.listAlbums));
router.get("/search", (0, responsehandler_1.responseMid)(functions_1.searchContent));
router.get("/album/details", (0, responsehandler_1.responseMid)(functions_1.getAlbumById));
router.get("/track/details", (0, responsehandler_1.responseMid)(functions_1.getTrackById));
router.get("/users/search", (0, responsehandler_1.responseMid)(functions_1.searchUsers));
router.get("/user/details", (0, responsehandler_1.responseMid)(functions_1.getUserById));
router.put("/user", (0, responsehandler_1.responseMid)(functions_1.updateUser));
router.post("/album", (0, responsehandler_1.responseMid)(functions_1.createAlbum));
router.put("/album", (0, responsehandler_1.responseMid)(functions_1.updateAlbum));
router.post("/track", (0, responsehandler_1.responseMid)(functions_1.createTrack));
router.put("/track", (0, responsehandler_1.responseMid)(functions_1.updateTrack));
router.get("/object-id/album", (0, responsehandler_1.responseMid)(functions_1.generateAlbumId));
router.get("/object-id/track", (0, responsehandler_1.responseMid)(functions_1.generateTrackId));
router.delete("/deleteFromRecents", (0, responsehandler_1.responseMid)(functions_1.deleteAlbumFromRecents));
router.get("/fixJson", (0, responsehandler_1.responseMid)(functions_1.fixJson));
router.post("/addTrack", (0, responsehandler_1.responseMid)(functions_1.addTrack));
// router.post("/albums-insert", responseMid(albumsInsert));
router.use("*", (_, response) => {
    return response.status(404).end();
});
exports.default = router;
//# sourceMappingURL=index.js.map
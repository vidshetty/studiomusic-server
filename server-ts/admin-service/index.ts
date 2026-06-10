import { Request, Response, NextFunction, Router } from "express";
import { ENV } from "../helpers/utils";
import { responseMid } from "../helpers/responsehandler";
import {
    update,
    getUser,
    getAlbum,
    deleteAlbumFromRecents,
    fixJson,
    albumsInsert,
    addTrack,
    listAlbums,
    createAlbum,
    createTrack,
    generateAlbumId,
    generateTrackId,
    searchContent,
    getAlbumById,
    getTrackById,
    updateAlbum,
    updateTrack,
    searchUsers,
    getUserById,
    updateUser
} from "./functions";

const router = Router();



const accessCheck = (request: Request, response: Response, next: NextFunction) => {

    const auth = request.headers.authorization;

    if (auth !== ENV().ADMIN_ACCESS) {
        return response.status(500).send({
            message: "Invalid admin access"
        });
    }

    return next();

};


router.use(accessCheck);

router.post("/update", responseMid(update));

router.get("/getuser", responseMid(getUser));

router.get("/album", responseMid(getAlbum));

router.get("/albums", responseMid(listAlbums));

router.get("/search", responseMid(searchContent));

router.get("/album/details", responseMid(getAlbumById));

router.get("/track/details", responseMid(getTrackById));

router.get("/users/search", responseMid(searchUsers));

router.get("/user/details", responseMid(getUserById));

router.put("/user", responseMid(updateUser));

router.post("/album", responseMid(createAlbum));

router.put("/album", responseMid(updateAlbum));

router.post("/track", responseMid(createTrack));

router.put("/track", responseMid(updateTrack));

router.get("/object-id/album", responseMid(generateAlbumId));

router.get("/object-id/track", responseMid(generateTrackId));

router.delete("/deleteFromRecents", responseMid(deleteAlbumFromRecents));

router.get("/fixJson", responseMid(fixJson));

router.post("/addTrack", responseMid(addTrack));

// router.post("/albums-insert", responseMid(albumsInsert));

router.use("*", (_:any, response: Response) => {
    return response.status(404).end();
});



export default router;
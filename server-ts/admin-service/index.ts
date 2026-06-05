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
    generateTrackId
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

router.post("/album", responseMid(createAlbum));

router.post("/track", responseMid(createTrack));

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
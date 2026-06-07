import { Router, Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { androidApiAccessCheck, androidApiAuthCheck } from "../auth-service/functions";
import { responseMid } from "../helpers/responsehandler";
import { ENV } from "../helpers/utils";
import {
    getProfile,
    recordTime,
    getTrackDetails,
    addToRecentlyPlayed,
    removeFromRecentlyPlayed,
    getLyrics,
    signOut
} from "../api-service/functions";
import {
    activeSessions,
    checkServer,
    getLibrary,
    getAlbum,
    homeAlbums,
    search,
    startRadio,
    getMostPlayedRadio,
    checkForUpdates,
    downloadLatestUpdate
} from "./api-functions";


const router = Router();


router.get("/checkServer", responseMid(checkServer));

router.get("/downloadLatestUpdate", downloadLatestUpdate);

router.use(androidApiAuthCheck);

router.get("/whosthis", responseMid(getProfile));

router.use(androidApiAccessCheck);

router.get("/recordTime", responseMid(recordTime));

router.get("/getHomeAlbums", responseMid(homeAlbums));

router.get("/getLibrary", responseMid(getLibrary));

router.get("/getTrack", responseMid(getTrackDetails));

router.get("/getAlbumDetails", responseMid(getAlbum));

router.get("/search", responseMid(search));

router.post("/addToRecentlyPlayed", responseMid(addToRecentlyPlayed));

router.post("/removeFromRecentlyPlayed", responseMid(removeFromRecentlyPlayed));

router.get("/getLyrics", createProxyMiddleware({
    target: ENV().SERVER_GO_URL,
    changeOrigin: true,
    pathRewrite: (path: string, req: Request) => {
        return "/lyrics?" + (String(req.originalUrl || "").split("?")?.[1] || "");
    }
}));

router.get("/sign-out", responseMid(signOut));

router.get("/startradio", responseMid(startRadio));

router.get("/mostPlayedRadio", responseMid(getMostPlayedRadio));

router.get("/activeSessions", responseMid(activeSessions));

router.get("/checkForUpdates", responseMid(checkForUpdates));

router.use("*", (_:any, response: Response) => {
    return response.status(404).end();
});



export default router;
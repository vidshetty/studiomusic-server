import { Router, Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { apiAuthCheck, apiAccessCheck } from "../auth-service/functions";
import { responseMid } from "../helpers/responsehandler";
import {
    activateCheck,
    getLibrary,
    getProfile,
    homeAlbums,
    recordTime,
    getTrackDetails,
    getAlbumDetails,
    search,
    addToRecentlyPlayed,
    getLyrics,
    signOut,
    startRadio,
    getLatestUpdate,
    demoVideosLink,
    getOriginalResumeLink,
    sendEmailApi
} from "./functions";
import { ENV, MAIN_URL } from "../helpers/utils";


const router = Router();


router.get("/getLatestUpdate", responseMid(getLatestUpdate));

router.get("/link/:id/:linkType", getOriginalResumeLink);

router.get("/links/demo-videos", demoVideosLink);

router.post("/send-email", responseMid(sendEmailApi));

router.use(apiAuthCheck);

router.get("/whosthis", responseMid(getProfile));

router.use(apiAccessCheck);

router.get("/activateCheck", responseMid(activateCheck));

router.get("/recordTime", responseMid(recordTime));

router.get("/getHomeAlbums", responseMid(homeAlbums));

router.get("/getLibrary", responseMid(getLibrary));

router.get("/getTrack", responseMid(getTrackDetails));

router.get("/getAlbumDetails", responseMid(getAlbumDetails));

router.get("/search", responseMid(search));

router.post("/addToRecentlyPlayed", responseMid(addToRecentlyPlayed));

router.get("/getLyrics", createProxyMiddleware({
    target: ENV().SERVER_GO_URL,
    changeOrigin: true,
    pathRewrite: (path: string, req: Request) => {
        return "/lyrics?" + (String(req.originalUrl || "").split("?")?.[1] || "");
    }
}));

router.get("/sign-out", responseMid(signOut));

router.get("/startradio", responseMid(startRadio));

router.get("/goToRedirect", (_,res) => res.redirect(MAIN_URL + "/login"));

router.use("*", (_:any, response: Response) => {
    return response.status(404).end();
});



export default router;
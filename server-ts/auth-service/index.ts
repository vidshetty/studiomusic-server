import { Router, Response } from "express";
import { responseMid } from "../helpers/responsehandler";
import {
    requestAccess,
    servertypes,
    oauthCheck,
    continueAuthSignin,
    signOut
} from "./functions";

const router = Router();



router.post("/sign-out", responseMid(signOut));

router.post("/oauth-check", responseMid(oauthCheck));

router.post("/continue-oauth-signin", responseMid(continueAuthSignin));

router.get("/request-access", responseMid(requestAccess));

router.get("/server-type", responseMid(servertypes));

router.use("*", (_:any, response: Response) => {
    return response.status(404).end();
});



export default router;
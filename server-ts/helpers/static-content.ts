import { Router } from "express";
import { updateHtmlHead, userAgentCheck } from "../helpers/middlewares";
import { googleAuthCheck, rootAccessCheck, rootAuthCheck } from "../auth-service/functions";
import { setRedirectUriCookie, buildroot, MAIN_URL, PLAYER_URL } from "../helpers/utils";
import passport from "passport";
import path from "path";
import fs from "fs";

const router = Router();



// google sign in
router.get(
    "/google-signin",
    passport.authenticate("google", { failureRedirect: MAIN_URL + "/login?status=failed", session: false }),
    googleAuthCheck,
    (req, res, next) => {
        console.log("here");
        if (res.user.error) {
            return res.redirect(MAIN_URL + "/login?status=success&email=exists");
        }
        return res.redirect(`${MAIN_URL}/google-oauth-signin/${res.user._id}`);
    }
);

// google auth
router.get(
    "/google-oauth-signin/*",
    userAgentCheck,
    (req, res, next) => {
        const file_path = path.join(process.cwd(), buildroot, "main-build", "index.html");
        if (!fs.existsSync(file_path)) return res.status(404).end();
        return res.status(200).sendFile(file_path);
    }
);

// static assets file handler
router.get(
    [
        "/mobile/assets/static/*",
        "/main/assets/static/*",
        "/player/assets/static/*"
    ],
    (req,res,next) => {

        const url = req.path as string;
        
        const url_split = url.split("/");

        const folder_name = (() => {
            if (url.includes("/css")) return "css";
            if (url.includes("/js")) return "js";
            if (url.includes("/media")) return "media";
            return null;
        })();

        const build_name = (() => {
            if (url_split[1] === "mobile") return "mobile-build";
            if (url_split[1] === "main") return "main-build";
            if (url_split[1] === "player") return "player-build";
            return null;
        })();

        if (folder_name === null || build_name === null) {
            return res.status(404).end();
        }

        const file_path = path.join(
            process.cwd(),
            buildroot,
            build_name,
            "static",
            folder_name,
            url_split[url_split.length-1]
        );

        if (!fs.existsSync(file_path)) return res.status(404).end();

        return res.status(200).sendFile(file_path);

    }
);

// global assets file handler
router.get(
    [
        "/mobile/assets/*",
        "/main/assets/*",
        "/player/assets/*"
    ],
    (req,res,next) => {

        const url_split = req.path.split("/");

        const file_path = path.join(
            process.cwd(),
            buildroot,
            "player-build",
            url_split[url_split.length-1]
        );

        if (!fs.existsSync(file_path)) return res.status(404).end();

        return res.status(200).sendFile(file_path);

    }
);

// index html
router.get(
    "/",
    userAgentCheck,
    (req, res, next) => {
        const file_path = req.headers.host === "player.studiomusic.app" ?
            path.join(process.cwd(), buildroot, "player-build", "index.html") :
            path.join(process.cwd(), buildroot, "main-build", "index.html");
        if (!fs.existsSync(file_path)) return res.status(404).end();
        return res.status(200).sendFile(file_path);
    }
);

// player index html
router.get(
    [
        "/search",
        "/album/:albumId",
        "/album/:albumId/playable",
        "/track/:albumId/:trackId",
        "/track/:albumId/:trackId/playable"
    ],
    (req,res,next) => {
        if (req.headers.host !== "player.studiomusic.app") {
            return res.status(404).end();
        }
        return next();
    },
    userAgentCheck,
    rootAuthCheck,
    rootAccessCheck,
    async (req, res, next) => {

        const { result } = req;

        // if (!result.found) {
        //     setRedirectUriCookie(req.url, res);
        //     return res.redirect("/");
        // }

        // const file_path = path.join(process.cwd(), buildroot, "player-build", "index.html");

        // if (!fs.existsSync(file_path)) return res.status(404).end();

        // return res.status(200).sendFile(file_path);

        const url = new URL(req.url, `https://${req.headers.host}`);

        if (
            req.path.includes("/album") ||
            req.path.includes("/track")
        ) {

            if (!result.found) setRedirectUriCookie(url.href, res);

            const data: string = await updateHtmlHead(req);

            return res.status(200).send(data);

        }
        else {

            if (!result.found) {
                setRedirectUriCookie(url.href, res);
                return res.redirect(MAIN_URL);
            }

            const file_path = path.join(process.cwd(), buildroot, "player-build", "index.html");

            if (!fs.existsSync(file_path)) return res.status(404).end();

            return res.status(200).sendFile(file_path);

        }

    }
);

// mobile index html
router.get(
    "/mobileview",
    (req, res, next) => {
        const file_path = path.join(process.cwd(), buildroot, "mobile-build", "index.html");
        if (!fs.existsSync(file_path)) return res.status(404).end();
        return res.status(200).sendFile(file_path);
    }
);

// anything else
router.get(
    "/*",
    (req, res, next) => {
        if (req.headers.host === "player.studiomusic.app") {
            return res.redirect(PLAYER_URL);
        }
        return res.redirect(MAIN_URL);
    }
);



export default router;
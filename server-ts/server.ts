import "source-map-support/register";
import express, { Application, NextFunction, Request, Response } from "express";
import { config } from "dotenv";
import path from "path";
import fs from "fs";
import passport from "passport";
import https from "https";
import http from "http";
import _ from "lodash";

config({ path: path.join(process.cwd(), "ENV", ".env") });

import "./nodemailer-service";
import "./passport-service";
import staticservice from "./helpers/static-content";
import corshandler from "./helpers/corshandler";
import authservice from "./auth-service";
import apiservice from "./api-service";
import adminservice from "./admin-service";
import androidservice from "./android-service";
import { MongoStudioHandler } from "./helpers/mongodb-connection";
import { createProxyMiddleware } from "http-proxy-middleware";
import { ENV } from "./helpers/utils";
import {
    apiAuthCheck,
    apiAccessCheck,
    androidApiAuthCheck,
    androidApiAccessCheck
} from "./auth-service/functions";


const app: Application = express();
const PORT: number = parseInt(process.env.PORT || "5000");
const PROTOCOL: string = process.env.PROTOCOL || "http";



(async () => {



    await MongoStudioHandler.initialize();


    app.use(passport.initialize());
    app.use(corshandler);
    app.use(express.json());


    app.options("*", (_: Request, res: Response) => {
        return res.status(200).end();
    });

    app.use("/admin", adminservice);

    app.use("/api/auth", authservice);

    app.use("/api", apiservice);

    app.use("/android", androidservice);

    app.use(
        "/hls",
        // (req: Request, res: Response, next: NextFunction) => {
        //     const platform = _.isEmpty(req?.headers?.["accesstoken"] || "") ?
        //         "web" : "android";
        //     console.log("accesstoken", req?.headers?.["accesstoken"]);
        //     if (platform === "android") {
        //         androidApiAuthCheck(req, res, next);
        //     } else {
        //         apiAuthCheck(req, res, next);
        //     }
        // },
        // (req: Request, res: Response, next: NextFunction) => {
        //     const platform = _.isEmpty(req?.headers?.["accesstoken"] || "") ?
        //         "web" : "android";
        //     console.log("accesstoken", req?.headers?.["accesstoken"]);
        //     if (platform === "android") {
        //         androidApiAccessCheck(req, res, next);
        //     } else {
        //         apiAccessCheck(req, res, next);
        //     }
        // },
        createProxyMiddleware({
            target: ENV().SERVER_GO_URL,
            changeOrigin: true,
            pathRewrite: (path: string, req: Request) => {
                return req.originalUrl;
            }
        })
    );

    app.get("/login/google", passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false
    }));

    app.get("/.well-known/assetlinks.json", (_: Request, response: Response) => {
        const file_path = path.join(process.cwd(), "data", "assetlinks.json");
        response.setHeader("Content-Type", "application/json");
        response.sendFile(file_path);
    });

    app.use("/", staticservice);


    if (PROTOCOL === "http") {
        http
            .createServer(app)
            .listen(PORT, () => {
                console.log(`Running on http port ${PORT}`);
            });
    }
    else {
        https.createServer(
            {
                key: fs.readFileSync(path.join(process.cwd(), "CERTIFICATES", "key.pem")),
                cert: fs.readFileSync(path.join(process.cwd(), "CERTIFICATES", "cert.pem"))
            },
            app
        )
            .listen(PORT, () => {
                console.log(`Running on https port ${PORT}`);
            });
    }



})();
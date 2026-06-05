"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const passport_1 = __importDefault(require("passport"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
(0, dotenv_1.config)({ path: path_1.default.join(process.cwd(), "ENV", ".env") });
require("./nodemailer-service");
require("./passport-service");
const static_content_1 = __importDefault(require("./helpers/static-content"));
const corshandler_1 = __importDefault(require("./helpers/corshandler"));
const auth_service_1 = __importDefault(require("./auth-service"));
const api_service_1 = __importDefault(require("./api-service"));
const admin_service_1 = __importDefault(require("./admin-service"));
const android_service_1 = __importDefault(require("./android-service"));
const mongodb_connection_1 = require("./helpers/mongodb-connection");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const utils_1 = require("./helpers/utils");
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || "5000");
const PROTOCOL = process.env.PROTOCOL || "http";
(async () => {
    await mongodb_connection_1.MongoStudioHandler.initialize();
    app.use(passport_1.default.initialize());
    app.use(corshandler_1.default);
    app.use(express_1.default.json());
    app.options("*", (_, res) => {
        return res.status(200).end();
    });
    app.use("/admin", admin_service_1.default);
    app.use("/api/auth", auth_service_1.default);
    app.use("/api", api_service_1.default);
    app.use("/android", android_service_1.default);
    app.use("/hls", 
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
    (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: (0, utils_1.ENV)().SERVER_GO_URL,
        changeOrigin: true,
        pathRewrite: (path, req) => {
            return req.originalUrl;
        }
    }));
    app.get("/login/google", passport_1.default.authenticate("google", {
        scope: ["profile", "email"],
        session: false
    }));
    app.get("/.well-known/assetlinks.json", (_, response) => {
        const file_path = path_1.default.join(process.cwd(), "data", "assetlinks.json");
        response.setHeader("Content-Type", "application/json");
        response.sendFile(file_path);
    });
    app.use("/", static_content_1.default);
    if (PROTOCOL === "http") {
        http_1.default
            .createServer(app)
            .listen(PORT, () => {
            console.log(`Running on http port ${PORT}`);
        });
    }
    else {
        https_1.default.createServer({
            key: fs_1.default.readFileSync(path_1.default.join(process.cwd(), "CERTIFICATES", "key.pem")),
            cert: fs_1.default.readFileSync(path_1.default.join(process.cwd(), "CERTIFICATES", "cert.pem"))
        }, app)
            .listen(PORT, () => {
            console.log(`Running on https port ${PORT}`);
        });
    }
})();
//# sourceMappingURL=server.js.map
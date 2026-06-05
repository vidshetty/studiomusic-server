"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const googleapis_1 = require("googleapis");
const utils_1 = require("../helpers/utils");
const oAuthClient = new googleapis_1.google.auth.OAuth2((0, utils_1.ENV)().GMAIL_CLIENT_ID, (0, utils_1.ENV)().GMAIL_CLIENT_SECRET, (0, utils_1.ENV)().GMAIL_REDIRECT_URI);
oAuthClient.setCredentials({ refresh_token: (0, utils_1.ENV)().GMAIL_REFRESH_TOKEN });
const sendEmail = async (options) => {
    const accessToken = await oAuthClient.getAccessToken();
    const transport = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: (0, utils_1.ENV)().GMAIL_USERNAME,
            clientId: (0, utils_1.ENV)().GMAIL_CLIENT_ID,
            clientSecret: (0, utils_1.ENV)().GMAIL_CLIENT_SECRET,
            refreshToken: (0, utils_1.ENV)().GMAIL_REFRESH_TOKEN,
            accessToken
        }
    });
    if (!options.from)
        options.from = "StudioMusic <studiomusiccompany@gmail.com>";
    try {
        return await transport.sendMail(options);
    }
    catch (e) {
        throw e;
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=index.js.map
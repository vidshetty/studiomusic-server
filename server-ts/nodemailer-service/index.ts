import nodemailer from "nodemailer";
import { google } from "googleapis";
import { ENV } from "../helpers/utils";
import { NodemailerOptions } from "../helpers/interfaces";


const oAuthClient = new google.auth.OAuth2(
    ENV().GMAIL_CLIENT_ID,
    ENV().GMAIL_CLIENT_SECRET,
    ENV().GMAIL_REDIRECT_URI
);
oAuthClient.setCredentials({ refresh_token: ENV().GMAIL_REFRESH_TOKEN });


export const sendEmail = async (options: NodemailerOptions) => {

    const accessToken: any = await oAuthClient.getAccessToken();

    const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: ENV().GMAIL_USERNAME,
            clientId: ENV().GMAIL_CLIENT_ID,
            clientSecret: ENV().GMAIL_CLIENT_SECRET,
            refreshToken: ENV().GMAIL_REFRESH_TOKEN,
            accessToken
        }
    });

    if (!options.from) options.from = "StudioMusic <studiomusiccompany@gmail.com>";

    try {
        return await transport.sendMail(options);
    }
    catch(e) {
        throw e;
    }

};
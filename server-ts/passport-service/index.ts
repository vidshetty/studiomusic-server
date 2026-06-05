import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import { ENV, PASSPORT_REDIRECT_APP_URL } from "../helpers/utils";


const googleStrat: any = {
    clientID: ENV().GOOGLE_CLIENT_ID,
    clientSecret: ENV().GOOGLE_CLIENT_SECRET,
    callbackURL: ENV().ENVIRONMENT === "LOCAL" ? "/google-signin" :
                `${PASSPORT_REDIRECT_APP_URL}/google-signin`
};

passport.serializeUser((user: any, done: any) => {
    done(null, user.id);
});

passport.use(
    new Strategy(googleStrat, (accessToken:any, refreshToken:any, profile:any, done:any) => {
        return done(null, profile);
    })
);
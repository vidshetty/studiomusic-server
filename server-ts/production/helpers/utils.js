"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToAlbumListFromDB = exports.convertToAndroidTrackFromDB = exports.convertToAndroidAlbumFromDB = exports.convertToAndroidTrack = exports.convertToAndroidAlbum = exports.randomize = exports.getCurrentTime = exports.CustomError = exports.getDevice = exports.writeFileAsync = exports.readFileAsync = exports.__replace = exports.checkRedirectUri = exports.calcPeriod = exports.setRedirectUriCookie = exports.redirectUriCookieConfig = exports.standardCookieConfig = exports.cookieParser = exports.server = exports.date = exports.ejsRender = exports.wait = exports.requestUrlCheck = exports.ENV = exports.BUILD_TYPE = exports.defaultResumeLinks = exports.defaultUserId = exports.buildroot = exports.issuer = exports.refreshTokenExpiry = exports.accessTokenExpiry = exports.androidAccessTokenExpiry = exports.timezone = exports.defaultAccess = exports.PASSPORT_REDIRECT_APP_URL = exports.PLAYER_URL = exports.MAIN_URL = exports.APP_URL = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const ejs_1 = __importDefault(require("ejs"));
const fs_1 = __importDefault(require("fs"));
const lodash_1 = __importDefault(require("lodash"));
exports.APP_URL = "studiomusic.app";
exports.MAIN_URL = "https://studiomusic.app";
exports.PLAYER_URL = "https://player.studiomusic.app";
exports.PASSPORT_REDIRECT_APP_URL = "https://studiomusic.app";
exports.defaultAccess = 30 * 24 * 60 * 60;
exports.timezone = "Asia/Kolkata";
exports.androidAccessTokenExpiry = "30d";
exports.accessTokenExpiry = "1h";
exports.refreshTokenExpiry = "30d";
exports.issuer = "StudioMusic";
exports.buildroot = "builds";
exports.defaultUserId = "620e2e2693c8702fed063743";
exports.defaultResumeLinks = Object.freeze({
    LINKEDIN: "https://www.linkedin.com/in/vidhatashetty/",
    GITHUB: "https://github.com/vidshetty",
    LEETCODE: "https://leetcode.com/u/vid_shetty/",
    STUDIOMUSIC_APP: "https://studiomusic.app",
    STUDIOMUSIC_DEMO_VIDEOS: "https://drive.google.com/drive/folders/1wmwPzsUtm49oDvs6LQlOr7CATfvzTNNX?usp=drive_link",
    STUDIOMUSIC_BACKEND: "https://github.com/vidshetty/studio-server-ts",
    STUDIOMUSIC_ANDROID: "https://github.com/vidshetty/studiomusic-java",
    WASSUPPRO_BACKEND: "https://github.com/vidshetty/wassuppro"
});
exports.BUILD_TYPE = Object.freeze({
    DEBUG: "debug",
    RELEASE: "release"
});
const ENV = () => {
    return Object.freeze({
        ADMIN_ACCESS: process.env.ADMIN_ACCESS || "",
        ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "",
        REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "",
        SERVER: process.env.SERVER || "",
        ENVIRONMENT: process.env.ENVIRONMENT || "",
        PORT: process.env.PORT || "",
        MONGO_URI: process.env.MONGO_URI || "",
        GMAIL_USERNAME: process.env.GMAIL_USERNAME || "",
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
        GMAIL_CLIENT_ID: process.env.GMAIL_CLIENT_ID || "",
        GMAIL_CLIENT_SECRET: process.env.GMAIL_CLIENT_SECRET || "",
        GMAIL_REDIRECT_URI: process.env.GMAIL_REDIRECT_URI || "",
        GMAIL_REFRESH_TOKEN: process.env.GMAIL_REFRESH_TOKEN || "",
        DRIVE_LINK: process.env.DRIVE_LINK || "",
        SERVER_GO_URL: process.env.SERVER_GO_URL || ""
    });
};
exports.ENV = ENV;
const requestUrlCheck = (req, from) => {
    const og_url = req.originalUrl;
    if (from === "android" && og_url.includes("android"))
        return true;
    if (from === "web" && !og_url.includes("android"))
        return true;
    return false;
};
exports.requestUrlCheck = requestUrlCheck;
const wait = (time) => {
    return new Promise((resolve, _) => setTimeout(resolve, time));
};
exports.wait = wait;
const ejsRender = (path, values) => {
    return new Promise((resolve, reject) => {
        ejs_1.default.renderFile(path, values, (err, data) => {
            if (err)
                reject(err);
            else
                resolve(data);
        });
    });
};
exports.ejsRender = ejsRender;
const date = (val) => (0, moment_timezone_1.default)(val, "DD-MM-YYYY").toDate();
exports.date = date;
exports.server = (() => {
    const SERVER = (0, exports.ENV)().SERVER;
    return [
        "https://player.studiomusic.app",
        "https://player.studiomusic.app",
        "https://player.studiomusic.app",
        "https://player.studiomusic.app",
    ];
})();
const cookieParser = (request) => {
    const cookies = request.headers.cookie;
    const obj = {};
    if (cookies === "" || cookies === undefined)
        return obj;
    const removedSpaces = cookies.split(" ").join("");
    const separated = removedSpaces.split(";");
    for (let i = 0; i < separated.length; i++) {
        const split = separated[i].split("=");
        if (split[0] !== "ACCOUNT" && split[0] !== "ACCOUNT_REFRESH")
            continue;
        obj[split[0]] = split[1];
    }
    return obj;
};
exports.cookieParser = cookieParser;
exports.standardCookieConfig = {
    sameSite: "none",
    secure: true,
    domain: (0, exports.ENV)().ENVIRONMENT === "LOCAL" ? "localhost" :
        exports.APP_URL,
    maxAge: 40 * 24 * 60 * 60 * 1000,
    httpOnly: true
};
exports.redirectUriCookieConfig = {
    sameSite: "none",
    secure: true,
    domain: (0, exports.ENV)().ENVIRONMENT === "LOCAL" ? "localhost" :
        exports.APP_URL,
    maxAge: 5 * 60 * 1000,
    httpOnly: true
};
const setRedirectUriCookie = (path, response) => {
    response.cookie("REDIRECT_URI", path, exports.redirectUriCookieConfig);
};
exports.setRedirectUriCookie = setRedirectUriCookie;
const calcPeriod = (duration) => {
    const __math = (val) => Math.floor(val);
    const seconds = __math(duration.asSeconds());
    const mins = __math(duration.asMinutes());
    const hours = __math(duration.asHours());
    const days = __math(duration.asDays());
    const months = __math(duration.asMonths());
    const years = __math(duration.asYears());
    if (years > 0) {
        // if (years > 1) return "unlimited";
        let time = `${years} ${years > 1 ? "years" : "year"}`;
        const rem = months - (years * 12);
        if (rem > 0)
            time += ` ${rem} ${rem > 1 ? "months" : "month"}`;
        return time;
    }
    if (months > 0) {
        let time = `${months} ${months > 1 ? "months" : "month"}`;
        const rem = days - (months * 30);
        if (rem > 0)
            time += ` ${rem} ${rem > 1 ? "days" : "day"}`;
        return time;
    }
    if (days > 0) {
        let time = `${days} ${days > 1 ? "days" : "day"}`;
        const rem = hours - (days * 24);
        if (rem > 0)
            time += ` ${rem} ${rem > 1 ? "hours" : "hour"}`;
        return time;
    }
    if (hours > 0) {
        let time = `${hours} ${hours > 1 ? "hours" : "hour"}`;
        const rem = mins - (hours * 60);
        if (rem > 0)
            time += ` ${rem} ${rem > 1 ? "minutes" : "minute"}`;
        return time;
    }
    if (mins > 0) {
        return `${mins} ${mins > 1 ? "minutes" : "minute"}`;
    }
    if (seconds > 0) {
        return `${seconds} ${seconds > 1 ? "seconds" : "second"}`;
    }
    return "";
};
exports.calcPeriod = calcPeriod;
const checkRedirectUri = (request) => {
    const cookies = request.headers.cookie;
    const obj = {};
    if (cookies === "" || cookies === undefined)
        return null;
    const removedSpaces = cookies.split(" ").join("");
    const separated = removedSpaces.split(";");
    for (let i = 0; i < separated.length; i++) {
        const split = separated[i].split("=");
        if (split[0] !== "REDIRECT_URI")
            continue;
        obj[split[0]] = split[1];
    }
    const uri = obj["REDIRECT_URI"];
    if (uri === undefined)
        return null;
    return decodeURIComponent(uri);
    // return (
    //     uri && 
    //     uri.replace(/%2F/g, "/").replace(/%3F/g,"?").
    //         replace(/%3D/g,"=").replace(/%26/g,"&").
    //         replace(/%3A/g, ":")
    // ) || null;
};
exports.checkRedirectUri = checkRedirectUri;
const __replace = (string = "", list = [], replaceWith = "") => {
    let i = 0;
    while (i < string.length) {
        if (list.includes(string[i])) {
            const sep = string.split("");
            sep[i] = replaceWith;
            string = sep.join("");
        }
        else {
            i++;
        }
    }
    return string;
};
exports.__replace = __replace;
const readFileAsync = (fileName) => {
    return new Promise((resolve, reject) => {
        fs_1.default.readFile(fileName, { encoding: "utf-8" }, (err, data) => {
            if (err)
                reject(err);
            else
                resolve(data);
        });
    });
};
exports.readFileAsync = readFileAsync;
const writeFileAsync = (fileName, writeData) => {
    return new Promise((resolve, reject) => {
        fs_1.default.writeFile(fileName, writeData, (err) => {
            if (err)
                reject(err);
            else
                resolve("");
        });
    });
};
exports.writeFileAsync = writeFileAsync;
const getDevice = (request) => {
    const deviceInfoString = request.headers["device-info"] || null;
    if (deviceInfoString === null)
        return request.headers["user-agent"] || null;
    const deviceInfo = JSON.parse(deviceInfoString);
    return `${deviceInfo.manufacturer} ${deviceInfo.model} ${deviceInfo.device_id}`;
};
exports.getDevice = getDevice;
class CustomError extends Error {
    constructor(msg, body) {
        super(msg === null ? "" : msg);
        this.body = null;
        this.body = body;
    }
}
exports.CustomError = CustomError;
;
const getCurrentTime = () => {
    return (0, moment_timezone_1.default)().tz(exports.timezone).format("DD MMM YYYY, h:mm:ss a");
};
exports.getCurrentTime = getCurrentTime;
const randomize = (arr) => {
    let i, len = arr.length, rand;
    for (i = len - 1; i >= 0; i--) {
        rand = Math.floor(Math.random() * len);
        [arr[i], arr[rand]] = [arr[rand], arr[i]];
    }
    return arr;
};
exports.randomize = randomize;
const convertToAndroidAlbum = (arr = []) => {
    return arr.reduce((acc, each) => {
        const album = each;
        const single = each;
        acc.push({
            _albumId: each._albumId,
            Album: each.Album,
            AlbumArtist: each.AlbumArtist,
            Type: each.Type,
            Year: each.Year,
            Color: each.Color,
            LightColor: (each === null || each === void 0 ? void 0 : each.LightColor) || null,
            DarkColor: (each === null || each === void 0 ? void 0 : each.DarkColor) || null,
            Thumbnail: each.Thumbnail,
            releaseDate: each.releaseDate,
            Tracks: (() => {
                if (each.Type === "Album") {
                    return album.Tracks.map(track => {
                        track.streamCount = 0;
                        track.lyrics = track.lyrics || false;
                        track.sync = track.sync || false;
                        return track;
                    });
                }
                if (each.Type === "Single") {
                    return [{
                            _trackId: single._trackId,
                            Title: single.Album,
                            Artist: single.Artist,
                            Duration: single.Duration,
                            url: single.url,
                            streamCount: 0,
                            lyrics: single.lyrics || false,
                            sync: single.sync || false
                        }];
                }
                return [];
            })()
        });
        return acc;
    }, []);
};
exports.convertToAndroidAlbum = convertToAndroidAlbum;
const convertToAndroidTrack = (arr = []) => {
    return arr.reduce((acc, each) => {
        const album = each;
        const single = each;
        if (each.Type === "Single") {
            acc.push({
                _albumId: single._albumId,
                Album: single.Album,
                Color: single.Color,
                LightColor: (single === null || single === void 0 ? void 0 : single.LightColor) || null,
                DarkColor: (single === null || single === void 0 ? void 0 : single.DarkColor) || null,
                Thumbnail: single.Thumbnail,
                Year: single.Year,
                Type: single.Type,
                releaseDate: single.releaseDate,
                _trackId: single._trackId,
                Title: single.Album,
                Artist: single.Artist,
                Duration: single.Duration,
                url: single.url,
                streamCount: 0,
                lyrics: single.lyrics || false,
                sync: single.sync || false
            });
        }
        else {
            album.Tracks.forEach((track) => {
                acc.push({
                    _albumId: album._albumId,
                    Album: album.Album,
                    Color: album.Color,
                    LightColor: (single === null || single === void 0 ? void 0 : single.LightColor) || null,
                    DarkColor: (single === null || single === void 0 ? void 0 : single.DarkColor) || null,
                    Thumbnail: album.Thumbnail,
                    Year: album.Year,
                    Type: album.Type,
                    releaseDate: album.releaseDate,
                    _trackId: track._trackId,
                    Title: track.Title,
                    Artist: track.Artist,
                    Duration: track.Duration,
                    url: track.url,
                    streamCount: 0,
                    lyrics: track.lyrics || false,
                    sync: track.sync || false
                });
            });
        }
        return acc;
    }, []);
};
exports.convertToAndroidTrack = convertToAndroidTrack;
const convertToAndroidAlbumFromDB = (albums, tracks) => {
    return albums.reduce((acc, each) => {
        acc.push({
            _albumId: String(each._albumId),
            Album: each.Album,
            AlbumArtist: String(each.AlbumArtist),
            Type: each.Type,
            Year: each.Year,
            Color: each.Color,
            LightColor: (each === null || each === void 0 ? void 0 : each.LightColor) || null,
            DarkColor: (each === null || each === void 0 ? void 0 : each.DarkColor) || null,
            Thumbnail: each.Thumbnail,
            releaseDate: (0, moment_timezone_1.default)(each.releaseDate, "YYYY-MM-DD").toDate(),
            Tracks: lodash_1.default.reduce(tracks, (acc, t) => {
                if (String(t._albumId) !== String(each._albumId))
                    return acc;
                acc.push({
                    _trackId: String(t._trackId),
                    Title: t.Title,
                    Artist: t.Artist,
                    Duration: t.Duration,
                    url: t.url,
                    streamCount: t.streamCount,
                    lyrics: t.lyrics || false,
                    sync: t.sync || false
                });
                return acc;
            }, [])
        });
        return acc;
    }, []);
};
exports.convertToAndroidAlbumFromDB = convertToAndroidAlbumFromDB;
const convertToAndroidTrackFromDB = (albums, tracks) => {
    return lodash_1.default.reduce(tracks, (acc, each) => {
        var _a;
        const album = ((_a = (lodash_1.default.filter(albums, (a) => {
            return String(a._albumId) === String(each._albumId);
        }))) === null || _a === void 0 ? void 0 : _a[0]) || null;
        if (lodash_1.default.isEmpty(album))
            return acc;
        acc.push({
            _albumId: String(each._albumId),
            Album: album.Album,
            Color: album.Color,
            LightColor: (album === null || album === void 0 ? void 0 : album.LightColor) || null,
            DarkColor: (album === null || album === void 0 ? void 0 : album.DarkColor) || null,
            Thumbnail: album.Thumbnail,
            Year: album.Year,
            Type: album.Type,
            releaseDate: (0, moment_timezone_1.default)(album.releaseDate, "YYYY-MM-DD").toDate(),
            _trackId: String(each._trackId),
            Title: each.Title,
            Artist: each.Artist,
            Duration: each.Duration,
            url: each.url,
            streamCount: each.streamCount,
            lyrics: (each === null || each === void 0 ? void 0 : each.lyrics) || false,
            sync: (each === null || each === void 0 ? void 0 : each.sync) || false
        });
        return acc;
    }, []);
};
exports.convertToAndroidTrackFromDB = convertToAndroidTrackFromDB;
const convertToAlbumListFromDB = (albums, tracks) => {
    let reducingTracks = tracks;
    return lodash_1.default.reduce(albums, (acc, album) => {
        const remainingTracks = [];
        const tracksOfAlbum = lodash_1.default.filter(reducingTracks, (track) => {
            if (String(track._albumId) === String(album._albumId))
                return true;
            remainingTracks.push(track);
            return false;
        });
        reducingTracks = remainingTracks;
        if (lodash_1.default.isEmpty(tracksOfAlbum))
            return acc;
        if (album.Type === "Album") {
            const obj = {
                _albumId: String(album._albumId),
                Album: album.Album,
                AlbumArtist: String(album.AlbumArtist),
                Type: "Album",
                Year: album.Year,
                Color: album.Color,
                LightColor: album.LightColor,
                DarkColor: album.DarkColor,
                releaseDate: (0, moment_timezone_1.default)(album.releaseDate, "YYYY-MM-DD").toDate(),
                Thumbnail: album.Thumbnail,
                Tracks: lodash_1.default.reduce(tracksOfAlbum, (acc, each) => {
                    acc.push({
                        _trackId: String(each._trackId),
                        Title: each.Title,
                        Artist: each.Artist,
                        Duration: each.Duration,
                        url: each.url,
                        streamCount: each.streamCount,
                        lyrics: each.lyrics,
                        sync: each.sync
                    });
                    return acc;
                }, [])
            };
            acc.push(obj);
        }
        if (album.Type === "Single") {
            const track = tracksOfAlbum[0];
            const obj = {
                _albumId: String(album._albumId),
                _trackId: String(track._trackId),
                Album: album.Album,
                AlbumArtist: String(album.AlbumArtist),
                Type: "Single",
                Year: album.Year,
                Color: album.Color,
                LightColor: album.LightColor,
                DarkColor: album.DarkColor,
                releaseDate: (0, moment_timezone_1.default)(album.releaseDate, "YYYY-MM-DD").toDate(),
                Thumbnail: album.Thumbnail,
                Artist: track.Artist,
                Duration: track.Duration,
                url: track.url,
                lyrics: track.lyrics,
                sync: track.sync,
                streamCount: track.streamCount
            };
            acc.push(obj);
        }
        return acc;
    }, []);
};
exports.convertToAlbumListFromDB = convertToAlbumListFromDB;
//# sourceMappingURL=utils.js.map
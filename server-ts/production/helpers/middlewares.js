"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.androidErrorHandler = exports.updateHtmlHead = exports.ipAddress = exports.httpsRedirect = exports.userAgentCheck = void 0;
const functions_1 = require("../api-service/functions");
const geoip_lite_1 = require("geoip-lite");
const utils_1 = require("../helpers/utils");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const userAgentCheck = (request, response, next) => {
    const ua = (request.headers["user-agent"] || "").toLowerCase();
    let found = false;
    const notAllowed = [
        "android",
        "ios",
        "mobile"
    ];
    for (let i = 0; i < notAllowed.length; i++) {
        if (ua.includes(notAllowed[i])) {
            found = true;
            break;
        }
    }
    if (found)
        return response.redirect(utils_1.MAIN_URL + "/mobileview");
    return next();
};
exports.userAgentCheck = userAgentCheck;
const httpsRedirect = (request, response, next) => {
    const allowedHosts = [
        "localhost:5000",
        "192.168.29.77:5000",
        "localhost:7000",
        "192.168.29.77:7000"
    ];
    const protocol = request.headers["x-forwarded-proto"] || "";
    const host = request.headers["host"] || "";
    const isHttps = protocol === "https";
    let validHost = false;
    for (let i = 0; i < allowedHosts.length; i++) {
        if (allowedHosts[i] === host) {
            validHost = true;
            break;
        }
    }
    if (validHost)
        return next();
    if (!isHttps)
        return response.redirect(`https://${host}${request.url}`);
    return next();
};
exports.httpsRedirect = httpsRedirect;
const ipAddress = (request, response, next) => {
    try {
        const ip = request.headers["x-forwarded-for"] || "no 'x-forwarded-for' header";
        const ipData = (0, geoip_lite_1.lookup)(ip);
        // console.log(
        //     "IP address",
        //     ip,
        //     `${(ipData && ipData.city) || "no city"}, ${ipData && ipData.country}`
        // );
    }
    catch (e) {
    }
    finally {
        return next();
    }
};
exports.ipAddress = ipAddress;
const updateHtmlHead = async (request) => {
    const defaultImageUrl = "https://studiomusic.app/player/assets/preview-studio-black.png";
    if (request.url.includes("album")) {
        request.query = { albumId: request.params.albumId };
        const album = await (0, functions_1.getAlbum)(request);
        const file_path = path_1.default.join(process.cwd(), utils_1.buildroot, "player-build", "index.ejs");
        if (!fs_1.default.existsSync(file_path))
            return "";
        return await (0, utils_1.ejsRender)(file_path, {
            title: album !== null ? `${album.Album} - ${album.AlbumArtist}` : "StudioMusic",
            image: album !== null ? album.Thumbnail : defaultImageUrl
        });
    }
    if (request.url.includes("track")) {
        request.query = {
            albumId: request.params.albumId,
            trackId: request.params.trackId
        };
        const track = (0, functions_1.getTrack)(request);
        const file_path = path_1.default.join(process.cwd(), utils_1.buildroot, "player-build", "index.ejs");
        if (!fs_1.default.existsSync(file_path))
            return "";
        return await (0, utils_1.ejsRender)(file_path, {
            title: track !== null ? `${track.Title || track.Album} - ${track.AlbumArtist}` : "StudioMusic",
            image: track !== null ? track.Thumbnail : defaultImageUrl
        });
    }
    return "";
};
exports.updateHtmlHead = updateHtmlHead;
const androidErrorHandler = (err, req, res, next) => {
    res.status(500).json(err.body);
};
exports.androidErrorHandler = androidErrorHandler;
//# sourceMappingURL=middlewares.js.map
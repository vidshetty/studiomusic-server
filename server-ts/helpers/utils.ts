import { Request, Response, CookieOptions } from "express";
import moment, { Duration } from "moment-timezone";
import ejs from "ejs";
import fs from "fs";
import _ from "lodash";
import {
    AlbumList,
    AndroidAlbum,
    CookieInterface,
    DeviceInfo,
    Album,
    Single,
    AndroidTrack,
    Track
} from "../helpers/interfaces";
import { AlbumSchema, TracksSchema } from "./schema";



export const APP_URL = "studiomusic.app";
export const MAIN_URL = "https://studiomusic.app";
export const PLAYER_URL = "https://player.studiomusic.app";
export const PASSPORT_REDIRECT_APP_URL = "https://studiomusic.app";
export const defaultAccess = 30*24*60*60;
export const timezone = "Asia/Kolkata";
export const androidAccessTokenExpiry = "30d";
export const accessTokenExpiry = "1h";
export const refreshTokenExpiry = "30d";
export const issuer = "StudioMusic";
export const buildroot = "builds";
export const defaultUserId = "620e2e2693c8702fed063743";
export const defaultResumeLinks: { [key: string]: string } = Object.freeze({
    LINKEDIN: "https://www.linkedin.com/in/vidhatashetty/",
    GITHUB: "https://github.com/vidshetty",
    LEETCODE: "https://leetcode.com/u/vid_shetty/",
    STUDIOMUSIC_APP: "https://studiomusic.app",
    STUDIOMUSIC_DEMO_VIDEOS: "https://drive.google.com/drive/folders/1wmwPzsUtm49oDvs6LQlOr7CATfvzTNNX?usp=drive_link",
    STUDIOMUSIC_BACKEND: "https://github.com/vidshetty/studio-server-ts",
    STUDIOMUSIC_ANDROID: "https://github.com/vidshetty/studiomusic-java",
    WASSUPPRO_BACKEND: "https://github.com/vidshetty/wassuppro"
});

export const BUILD_TYPE = Object.freeze({
    DEBUG: "debug",
    RELEASE: "release"
});

export const ENV = () => {
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

export const requestUrlCheck = (req: Request, from: string) : boolean => {
    const og_url: string = req.originalUrl;
    if (from === "android" && og_url.includes("android")) return true;
    if (from === "web" && !og_url.includes("android")) return true;
    return false;
};

export const wait = (time: number) => {
    return new Promise((resolve,_) => setTimeout(resolve, time));
};

export const ejsRender = (path: string, values: any): Promise<string> => {
    return new Promise((resolve,reject) => {
        ejs.renderFile(path, values, (err,data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
};

export const date = (val: string) : Date => moment(val,"DD-MM-YYYY").toDate(); 

export const server = (() : string[] => {

    const SERVER: string = ENV().SERVER;

    return [
        "https://player.studiomusic.app",
        "https://player.studiomusic.app",
        "https://player.studiomusic.app",
        "https://player.studiomusic.app",
    ];

})();

export const cookieParser = (request: Request): CookieInterface => {

    const cookies: string | undefined = request.headers.cookie;

    const obj: CookieInterface = {};
    if (cookies === "" || cookies === undefined) return obj;

    const removedSpaces = cookies.split(" ").join("");
    const separated = removedSpaces.split(";");
    
    for (let i=0; i<separated.length; i++) {
        const split = separated[i].split("=");
        if (split[0] !== "ACCOUNT" && split[0] !== "ACCOUNT_REFRESH") continue;
        obj[split[0]] = split[1];
    }

    return obj;

};

export const standardCookieConfig: CookieOptions = {
    sameSite: "none",
    secure: true,
    domain: ENV().ENVIRONMENT === "LOCAL" ? "localhost" : 
            APP_URL,
    maxAge: 40 * 24 * 60 * 60 * 1000,
    httpOnly: true
};

export const redirectUriCookieConfig: CookieOptions = {
    sameSite: "none",
    secure: true,
    domain: ENV().ENVIRONMENT === "LOCAL" ? "localhost" : 
            APP_URL,
    maxAge: 5 * 60 * 1000,
    httpOnly: true
};

export const setRedirectUriCookie = (path: string, response: Response) => {
    response.cookie("REDIRECT_URI", path, redirectUriCookieConfig);
};

export const calcPeriod = (duration: Duration): string => {

    const __math = (val: number): number => Math.floor(val);

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
        if (rem > 0) time += ` ${rem} ${rem > 1 ? "months" : "month"}`;
        return time;
    }
    
    if (months > 0) {
        let time = `${months} ${months > 1 ? "months" : "month"}`;
        const rem = days - (months * 30);
        if (rem > 0) time += ` ${rem} ${rem > 1 ? "days" : "day"}`;
        return time;
    }
    
    if (days > 0) {
        let time = `${days} ${days > 1 ? "days" : "day"}`;
        const rem = hours - (days * 24);
        if (rem > 0) time += ` ${rem} ${rem > 1 ? "hours" : "hour"}`;
        return time;
    }
    
    if (hours > 0) {
        let time = `${hours} ${hours > 1 ? "hours" : "hour"}`;
        const rem = mins - (hours * 60);
        if (rem > 0) time += ` ${rem} ${rem > 1 ? "minutes" : "minute"}`;
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

export const checkRedirectUri = (request: Request): string | null => {

    const cookies: string|undefined = request.headers.cookie;
    const obj: CookieInterface = {};

    if (cookies === "" || cookies === undefined) return null;

    const removedSpaces = cookies.split(" ").join("");
    const separated = removedSpaces.split(";");

    for (let i=0; i<separated.length; i++) {
        const split: string[] = separated[i].split("=");
        if (split[0] !== "REDIRECT_URI") continue;
        obj[split[0]] = split[1];
    }

    const uri = obj["REDIRECT_URI"];

    if (uri === undefined) return null;

    return decodeURIComponent(uri);

    // return (
    //     uri && 
    //     uri.replace(/%2F/g, "/").replace(/%3F/g,"?").
    //         replace(/%3D/g,"=").replace(/%26/g,"&").
    //         replace(/%3A/g, ":")
    // ) || null;

};

export const __replace = (string: string = "", list: string[] = [], replaceWith: string = ""): string => {

    let i = 0;

    while (i < string.length) {
        if (list.includes(string[i])) {
            const sep = string.split("");
            sep[i] = replaceWith;
            string = sep.join("");
        } else {
            i++;
        }
    }

    return string;

};

export const readFileAsync = (fileName: string): Promise<string> => {
    return new Promise((resolve,reject) => {
        fs.readFile(fileName, { encoding: "utf-8" }, (err,data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
};

export const writeFileAsync = (fileName: string, writeData: string): Promise<string> => {
    return new Promise((resolve,reject) => {
        fs.writeFile(fileName, writeData, (err) => {
            if (err) reject(err);
            else resolve("");
        });
    });
};

export const getDevice = (request: Request) : string|null => {

    const deviceInfoString: string|null = request.headers["device-info"] || null;
    if (deviceInfoString === null) return request.headers["user-agent"] || null;

    const deviceInfo: DeviceInfo = JSON.parse(deviceInfoString);

    return `${deviceInfo.manufacturer} ${deviceInfo.model} ${deviceInfo.device_id}`;

};

export class CustomError extends Error {
    body: any = null;
    constructor(msg: string|null, body: any) {
        super(msg === null ? "" : msg);
        this.body = body;
    }
};

export const getCurrentTime = () : string => {
    return moment().tz(timezone).format("DD MMM YYYY, h:mm:ss a");
};

export const randomize = (arr: Array<any>): Array<any> => {

    let i: number, len: number = arr.length, rand: number;
    for (i=len-1; i>=0; i--) {
        rand = Math.floor(Math.random() * len);
        [arr[i], arr[rand]] = [arr[rand], arr[i]];
    }
    return arr;

};

export const convertToAndroidAlbum = (arr: readonly AlbumList[] = []): AndroidAlbum[] => {

    return arr.reduce<AndroidAlbum[]>((acc: AndroidAlbum[], each) => {

        const album: Album = each as Album;
        const single: Single = each as Single;

        acc.push({
            _albumId: each._albumId,
            Album: each.Album,
            AlbumArtist: each.AlbumArtist,
            Type: each.Type,
            Year: each.Year,
            Color: each.Color,
            LightColor: each?.LightColor || null,
            DarkColor: each?.DarkColor || null,
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

export const convertToAndroidTrack = (arr: readonly AlbumList[] = []): AndroidTrack[] => {

    return arr.reduce<AndroidTrack[]>((acc: AndroidTrack[], each) => {

        const album = each as Album;
        const single = each as Single;

        if (each.Type === "Single") {
            acc.push({
                _albumId: single._albumId,
                Album: single.Album,
                Color: single.Color,
                LightColor: single?.LightColor || null,
                DarkColor: single?.DarkColor || null,
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
            album.Tracks.forEach((track: Track) => {
                acc.push({
                    _albumId: album._albumId,
                    Album: album.Album,
                    Color: album.Color,
                    LightColor: single?.LightColor || null,
                    DarkColor: single?.DarkColor || null,
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

export const convertToAndroidAlbumFromDB = (albums: AlbumSchema[], tracks: TracksSchema[]): AndroidAlbum[] => {

    return albums.reduce<AndroidAlbum[]>((acc: AndroidAlbum[], each) => {

        acc.push({
            _albumId: String(each._albumId),
            Album: each.Album,
            AlbumArtist: String(each.AlbumArtist),
            Type: each.Type,
            Year: each.Year,
            Color: each.Color,
            LightColor: each?.LightColor || null,
            DarkColor: each?.DarkColor || null,
            Thumbnail: each.Thumbnail,
            releaseDate: moment(each.releaseDate, "YYYY-MM-DD").toDate(),
            Tracks: _.reduce(tracks, (acc: AndroidAlbum["Tracks"], t: TracksSchema) => {
                if (String(t._albumId) !== String(each._albumId)) return acc;
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

export const convertToAndroidTrackFromDB = (albums: AlbumSchema[], tracks: TracksSchema[]): AndroidTrack[] => {

    return _.reduce(tracks, (acc: AndroidTrack[], each) => {

        const album = (
            _.filter(albums, (a: AlbumSchema) => {
                return String(a._albumId) === String(each._albumId);
            })
        )?.[0] || null;

        if (_.isEmpty(album)) return acc;

        acc.push({
            _albumId: String(each._albumId),
            Album: album.Album,
            Color: album.Color,
            LightColor: album?.LightColor || null,
            DarkColor: album?.DarkColor || null,
            Thumbnail: album.Thumbnail,
            Year: album.Year,
            Type: album.Type,
            releaseDate: moment(album.releaseDate, "YYYY-MM-DD").toDate(),
            _trackId: String(each._trackId),
            Title: each.Title,
            Artist: each.Artist,
            Duration: each.Duration,
            url: each.url,
            streamCount: each.streamCount,
            lyrics: each?.lyrics || false,
            sync: each?.sync || false
        });

        return acc;

    }, []);

};

export const convertToAlbumListFromDB = (albums: AlbumSchema[], tracks: TracksSchema[]): AlbumList[] => {

    let reducingTracks: TracksSchema[] = tracks;

    return _.reduce(albums, (acc: AlbumList[], album: AlbumSchema) => {

        const remainingTracks: TracksSchema[] = [];

        const tracksOfAlbum = _.filter(reducingTracks, (track: TracksSchema) => {
            if (String(track._albumId) === String(album._albumId)) return true;
            remainingTracks.push(track);
            return false;
        });

        reducingTracks = remainingTracks;

        if (_.isEmpty(tracksOfAlbum)) return acc;

        if (album.Type === "Album") {

            const obj: Album = {
                _albumId: String(album._albumId),
                Album: album.Album,
                AlbumArtist: String(album.AlbumArtist),
                Type: "Album",
                Year: album.Year,
                Color: album.Color,
                LightColor: album.LightColor,
                DarkColor: album.DarkColor,
                releaseDate: moment(album.releaseDate, "YYYY-MM-DD").toDate(),
                Thumbnail: album.Thumbnail,
                Tracks: _.reduce(tracksOfAlbum, (acc: Track[], each: TracksSchema) => {
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

            const obj: Single = {
                _albumId: String(album._albumId),
                _trackId: String(track._trackId),
                Album: album.Album,
                AlbumArtist: String(album.AlbumArtist),
                Type: "Single",
                Year: album.Year,
                Color: album.Color,
                LightColor: album.LightColor,
                DarkColor: album.DarkColor,
                releaseDate: moment(album.releaseDate, "YYYY-MM-DD").toDate(),
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
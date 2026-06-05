"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTrack = exports.generateTrackId = exports.generateAlbumId = exports.createTrack = exports.createAlbum = exports.listAlbums = exports.albumsInsert = exports.fixJson = exports.deleteAlbumFromRecents = exports.getAlbum = exports.getUser = exports.update = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const path_1 = __importDefault(require("path"));
const lodash_1 = __importDefault(require("lodash"));
const mongodb_1 = require("mongodb");
const nodemailer_service_1 = require("../nodemailer-service");
const archiveGateway_1 = __importDefault(require("../data/archiveGateway"));
const songlist2_1 = __importDefault(require("../data/songlist2"));
const utils_1 = require("../helpers/utils");
const mongodb_connection_1 = require("../helpers/mongodb-connection");
const emailUser = async (user) => {
    try {
        const { accountAccess, googleAccount } = user;
        const { duration = 0 } = accountAccess;
        const today = (0, moment_timezone_1.default)().tz(utils_1.timezone);
        const addedToday = (0, moment_timezone_1.default)(today).add(duration, "s");
        const dur = moment_timezone_1.default.duration((0, moment_timezone_1.default)(addedToday).diff((0, moment_timezone_1.default)(today)));
        const period = (0, utils_1.calcPeriod)(dur);
        const date = (0, moment_timezone_1.default)(addedToday).format("DD MMMM YYYY");
        const time = (0, moment_timezone_1.default)(addedToday).format("hh:mm A");
        const data = await (0, utils_1.ejsRender)(path_1.default.join(process.cwd(), utils_1.buildroot, "views", "accessextended.ejs"), {
            period,
            date,
            time
        });
        const options = {
            to: googleAccount.email,
            subject: "Access Extended",
            html: data
        };
        try {
            await (0, nodemailer_service_1.sendEmail)(options);
            return true;
        }
        catch (e) {
            console.log("e", e);
            return false;
        }
    }
    catch (e) {
        console.log("e", e);
        return false;
    }
};
const update = async (request, response) => {
    const { Users } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const body = {
        email: request.body.email || "",
        duration: request.body.duration || "",
        seen: request.body.seen,
        type: request.body.type || "allowed",
        sendEmail: request.body.sendEmail
    };
    if (body.seen === undefined || body.seen === null) {
        return { message: "add 'seen: boolean' to body" };
    }
    if (body.sendEmail === undefined || body.sendEmail === null) {
        return { message: "add 'sendEmail: boolean' to body" };
    }
    const { email, sendEmail } = body;
    console.log(body);
    delete body.email;
    delete body.sendEmail;
    if (body.duration) {
        const time = body.duration.split("*");
        const secs = time.reduce((acc, each) => acc * parseFloat(each), 1);
        body.duration = secs;
    }
    const user = await Users.findOne({
        "googleAccount.email": email
    });
    if (!user)
        return { msg: "No such user." };
    const { accountAccess, activeSessions = [] } = user;
    Object.assign(user, {
        accountAccess: Object.assign(Object.assign(Object.assign({}, accountAccess), body), { timeLimit: null }),
        activeSessions: lodash_1.default.map(activeSessions, (each) => {
            each.seen = false;
            return each;
        })
    });
    await Users.updateOne({ _id: new mongodb_1.ObjectId(user._id) }, { $set: user });
    if (sendEmail) {
        const sent = await emailUser(user);
        return { user, sent };
    }
    return { user, sent: false };
};
exports.update = update;
const getUser = async (_, _1) => {
    const { Users } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const user = await Users.findOne({
        _id: new mongodb_1.ObjectId(utils_1.defaultUserId)
    });
    if (!user)
        return {};
    return {
        length: user.recentlyPlayed.length,
        recentlyPlayed: user.recentlyPlayed,
        recentsLastModified: user.recentsLastModified
    };
};
exports.getUser = getUser;
const getAlbum = async (request, _) => {
    const { name } = request.query;
    if (!name)
        return [];
    return archiveGateway_1.default.reduce((acc, each) => {
        const album = each;
        const single = each;
        if (each.Type === "Single") {
            if (single.Album.toLowerCase().includes(name.toLowerCase())) {
                acc.push(single);
            }
        }
        if (each.Type === "Album") {
            if (album.Album.toLowerCase().includes(name.toLowerCase())) {
                acc.push(album);
            }
            else {
                for (let i = 0; i < album.Tracks.length; i++) {
                    if (album.Tracks[i].Title.toLowerCase().includes(name.toLowerCase())) {
                        acc.push(album);
                        break;
                    }
                }
            }
        }
        return acc;
    }, []);
};
exports.getAlbum = getAlbum;
const deleteAlbumFromRecents = async (request) => {
    const { Users } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const { id } = request.query;
    if (lodash_1.default.isEmpty(id))
        return false;
    const allIds = (lodash_1.default.isArray(id) ? id : [id]);
    const allUsers = await Users.find({}).toArray();
    for (let i = 0; i < allUsers.length; i++) {
        const { recentlyPlayed: recents, _id: userId } = allUsers[i];
        const toBeRemoved = recents.reduce((acc, each) => {
            const albumId = each.albumId;
            if (allIds.includes(albumId))
                acc.push(albumId);
            return acc;
        }, []);
        if (toBeRemoved.length > 0) {
            // await Users.updateOne(
            //     { _id: userId },
            //     { $pull: { recentlyPlayed: { albumId: { $in: toBeRemoved } } } }
            // );
            await Users.updateOne({ _id: new mongodb_1.ObjectId(userId) }, {
                $set: {
                    recentlyPlayed: lodash_1.default.filter(recents, e => {
                        return !toBeRemoved.includes(e.albumId);
                    })
                }
            });
        }
    }
    return true;
};
exports.deleteAlbumFromRecents = deleteAlbumFromRecents;
const fixJson = async (request, _) => {
    let { name } = request.query;
    name = (0, utils_1.__replace)(name, ['"', ':'], "");
    const fileName = path_1.default.join(process.cwd(), "data", "lyrics", "json", `${name}.json`);
    try {
        const data = JSON.parse(await (0, utils_1.readFileAsync)(fileName));
        const list = data.map((each) => {
            const startTimeMs = parseInt(`${each.startTimeMs}`);
            return { startTimeMs, words: each.words, key: each.key };
        });
        await (0, utils_1.writeFileAsync)(fileName, JSON.stringify(list));
        return {
            done: true
        };
    }
    catch (e) {
        if (e instanceof Error) {
            return {
                name: e.name,
                msg: e.message
            };
        }
    }
};
exports.fixJson = fixJson;
const albumsInsert = async () => {
    const { Albums, Tracks } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    console.log("TOTAL", archiveGateway_1.default.length);
    for (let i = 0; i < archiveGateway_1.default.length; i++) {
        console.log(i + 1);
        const each = archiveGateway_1.default[i];
        if (each.Type === "Single") {
            const single = each;
            const new_album = Object.assign({ _id: new mongodb_1.ObjectId(), _albumId: new mongodb_1.ObjectId(single._albumId), Album: single.Album, AlbumArtist: single.AlbumArtist, Year: single.Year, Color: single.Color, releaseDate: (0, moment_timezone_1.default)(single.releaseDate).format("YYYY-MM-DD"), Thumbnail: single.Thumbnail, Type: "Single" }, (() => {
                const obj = {};
                if (single.LightColor)
                    obj.LightColor = single.LightColor;
                if (single.DarkColor)
                    obj.DarkColor = single.DarkColor;
                return obj;
            })());
            const new_track = Object.assign(Object.assign({ _id: new mongodb_1.ObjectId(), _albumId: new mongodb_1.ObjectId(single._albumId), _trackId: new mongodb_1.ObjectId(single._trackId), Title: single.Album, Artist: single.Artist, url: single.url, Duration: single.Duration }, (() => {
                const obj = {};
                if (single.lyrics)
                    obj.lyrics = single.lyrics;
                if (single.sync)
                    obj.sync = single.sync;
                return obj;
            })()), { streamCount: 0 });
            await Albums.insertOne(new_album);
            await Tracks.insertOne(new_track);
        }
        else if (each.Type === "Album") {
            const album = each;
            const new_album = Object.assign({ _id: new mongodb_1.ObjectId(), _albumId: new mongodb_1.ObjectId(album._albumId), Album: album.Album, AlbumArtist: album.AlbumArtist, Year: album.Year, Color: album.Color, releaseDate: (0, moment_timezone_1.default)(album.releaseDate).format("YYYY-MM-DD"), Thumbnail: album.Thumbnail, Type: "Album" }, (() => {
                const obj = {};
                if (album.LightColor)
                    obj.LightColor = album.LightColor;
                if (album.DarkColor)
                    obj.DarkColor = album.DarkColor;
                return obj;
            })());
            await Albums.insertOne(new_album);
            for (let t = 0; t < album.Tracks.length; t++) {
                const track = album.Tracks[t];
                const new_track = Object.assign(Object.assign({ _id: new mongodb_1.ObjectId(), _albumId: new mongodb_1.ObjectId(album._albumId), _trackId: new mongodb_1.ObjectId(track._trackId), Title: track.Title, Artist: track.Artist, url: track.url, Duration: track.Duration }, (() => {
                    const obj = {};
                    if (track.lyrics)
                        obj.lyrics = track.lyrics;
                    if (track.sync)
                        obj.sync = track.sync;
                    return obj;
                })()), { streamCount: 0 });
                await Tracks.insertOne(new_track);
            }
        }
        console.log("-------------------");
    }
};
exports.albumsInsert = albumsInsert;
const serializeAlbum = (album) => (Object.assign(Object.assign({}, album), { _id: String(album._id), _albumId: String(album._albumId) }));
const serializeTrack = (track) => (Object.assign(Object.assign({}, track), { _id: String(track._id), _albumId: String(track._albumId), _trackId: String(track._trackId) }));
const listAlbums = async (request) => {
    var _a, _b;
    const q = String((_b = (_a = request.query.q) !== null && _a !== void 0 ? _a : request.query.search) !== null && _b !== void 0 ? _b : "").trim();
    if (!q) {
        return [];
    }
    const { Albums } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    const albums = await Albums.find({ Album: regex }, { projection: { _albumId: 1, Album: 1, Type: 1, AlbumArtist: 1, Year: 1 } })
        .sort({ Album: 1 })
        .limit(50)
        .toArray();
    return albums.map((a) => ({
        _albumId: String(a._albumId),
        Album: a.Album,
        Type: a.Type,
        AlbumArtist: a.AlbumArtist,
        Year: a.Year
    }));
};
exports.listAlbums = listAlbums;
const createAlbum = async (request) => {
    const body = request.body;
    if (!body.Album || !body.AlbumArtist || !body.Year || !body.Color || !body.releaseDate || !body.Thumbnail || !body.Type) {
        throw new Error("Missing required album fields.");
    }
    if (body.Type !== "Album" && body.Type !== "Single") {
        throw new Error("Type must be Album or Single.");
    }
    if (!body._albumId || !mongodb_1.ObjectId.isValid(body._albumId)) {
        throw new Error("Valid _albumId is required.");
    }
    const { Albums } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const new_album = Object.assign({ _id: new mongodb_1.ObjectId(), _albumId: new mongodb_1.ObjectId(body._albumId), Album: body.Album, AlbumArtist: body.AlbumArtist, Year: body.Year, Color: body.Color, releaseDate: (0, moment_timezone_1.default)(body.releaseDate).format("YYYY-MM-DD"), Thumbnail: body.Thumbnail, Type: body.Type }, (() => {
        const obj = {};
        if (body.LightColor)
            obj.LightColor = body.LightColor;
        if (body.DarkColor)
            obj.DarkColor = body.DarkColor;
        return obj;
    })());
    await Albums.insertOne(new_album);
    return {
        message: "Album created.",
        album: serializeAlbum(new_album)
    };
};
exports.createAlbum = createAlbum;
const createTrack = async (request) => {
    const body = request.body;
    if (!body._albumId || !body.Title || !body.Artist || !body.url || !body.Duration) {
        throw new Error("Missing required track fields (_albumId, Title, Artist, url, Duration).");
    }
    if (!mongodb_1.ObjectId.isValid(body._albumId)) {
        throw new Error("Valid _albumId is required.");
    }
    if (!body._trackId || !mongodb_1.ObjectId.isValid(body._trackId)) {
        throw new Error("Valid _trackId is required.");
    }
    const { Tracks } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const new_track = Object.assign({ _id: new mongodb_1.ObjectId(), _albumId: new mongodb_1.ObjectId(body._albumId), _trackId: new mongodb_1.ObjectId(body._trackId), Title: body.Title, Artist: body.Artist, url: body.url, Duration: body.Duration, streamCount: typeof body.streamCount === "number" ? body.streamCount : 0 }, (() => {
        const obj = {};
        if (body.lyrics)
            obj.lyrics = true;
        if (body.sync)
            obj.sync = true;
        return obj;
    })());
    await Tracks.insertOne(new_track);
    return {
        message: "Track created.",
        track: serializeTrack(new_track)
    };
};
exports.createTrack = createTrack;
const generateAlbumId = async () => ({
    objectId: new mongodb_1.ObjectId().toHexString()
});
exports.generateAlbumId = generateAlbumId;
const generateTrackId = async () => ({
    objectId: new mongodb_1.ObjectId().toHexString()
});
exports.generateTrackId = generateTrackId;
const addTrack = async () => {
    const { Albums, Tracks } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const ALBUMLIST = [songlist2_1.default[songlist2_1.default.length - 1]];
    console.log(ALBUMLIST);
    for (let i = 0; i < ALBUMLIST.length; i++) {
        console.log(i + 1);
        const each = ALBUMLIST[i];
        if (each.Type === "Single") {
            const single = each;
            const new_album = Object.assign({ _id: new mongodb_1.ObjectId(), _albumId: new mongodb_1.ObjectId(single._albumId), Album: single.Album, AlbumArtist: single.AlbumArtist, Year: single.Year, Color: single.Color, releaseDate: (0, moment_timezone_1.default)(single.releaseDate).format("YYYY-MM-DD"), Thumbnail: single.Thumbnail, Type: "Single" }, (() => {
                const obj = {};
                if (single.LightColor)
                    obj.LightColor = single.LightColor;
                if (single.DarkColor)
                    obj.DarkColor = single.DarkColor;
                return obj;
            })());
            const new_track = Object.assign(Object.assign({ _id: new mongodb_1.ObjectId(), _albumId: new mongodb_1.ObjectId(single._albumId), _trackId: new mongodb_1.ObjectId(single._trackId), Title: single.Album, Artist: single.Artist, url: single.url, Duration: single.Duration }, (() => {
                const obj = {};
                if (single.lyrics)
                    obj.lyrics = single.lyrics;
                if (single.sync)
                    obj.sync = single.sync;
                return obj;
            })()), { streamCount: 0 });
            await Albums.insertOne(new_album);
            await Tracks.insertOne(new_track);
        }
        else if (each.Type === "Album") {
            const album = each;
            const new_album = Object.assign({ _id: new mongodb_1.ObjectId(), _albumId: new mongodb_1.ObjectId(album._albumId), Album: album.Album, AlbumArtist: album.AlbumArtist, Year: album.Year, Color: album.Color, releaseDate: (0, moment_timezone_1.default)(album.releaseDate).format("YYYY-MM-DD"), Thumbnail: album.Thumbnail, Type: "Album" }, (() => {
                const obj = {};
                if (album.LightColor)
                    obj.LightColor = album.LightColor;
                if (album.DarkColor)
                    obj.DarkColor = album.DarkColor;
                return obj;
            })());
            await Albums.insertOne(new_album);
            for (let t = 0; t < album.Tracks.length; t++) {
                const track = album.Tracks[t];
                const new_track = Object.assign(Object.assign({ _id: new mongodb_1.ObjectId(), _albumId: new mongodb_1.ObjectId(album._albumId), _trackId: new mongodb_1.ObjectId(track._trackId), Title: track.Title, Artist: track.Artist, url: track.url, Duration: track.Duration }, (() => {
                    const obj = {};
                    if (track.lyrics)
                        obj.lyrics = track.lyrics;
                    if (track.sync)
                        obj.sync = track.sync;
                    return obj;
                })()), { streamCount: 0 });
                await Tracks.insertOne(new_track);
            }
        }
        console.log("-------------------");
    }
};
exports.addTrack = addTrack;
//# sourceMappingURL=functions.js.map
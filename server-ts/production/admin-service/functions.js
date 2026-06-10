"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTrack = exports.updateUser = exports.getUserById = exports.searchUsers = exports.updateTrack = exports.updateAlbum = exports.getTrackById = exports.getAlbumById = exports.searchContent = exports.generateTrackId = exports.generateAlbumId = exports.createTrack = exports.createAlbum = exports.listAlbums = exports.albumsInsert = exports.fixJson = exports.deleteAlbumFromRecents = exports.getAlbum = exports.getUser = exports.update = void 0;
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
const searchContent = async (request) => {
    var _a, _b;
    const q = String((_b = (_a = request.query.q) !== null && _a !== void 0 ? _a : request.query.search) !== null && _b !== void 0 ? _b : "").trim();
    if (!q) {
        return { albums: [], tracks: [] };
    }
    const { Albums, Tracks } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    const [albumDocs, trackDocs] = await Promise.all([
        Albums.find({ $or: [{ Album: regex }, { AlbumArtist: regex }] }, { projection: { _albumId: 1, Album: 1, Type: 1, AlbumArtist: 1, Year: 1 } })
            .sort({ Album: 1 })
            .limit(30)
            .toArray(),
        Tracks.find({ $or: [{ Title: regex }, { Artist: regex }] }, { projection: { _trackId: 1, _albumId: 1, Title: 1, Artist: 1, Duration: 1 } })
            .sort({ Title: 1 })
            .limit(30)
            .toArray()
    ]);
    const albumIds = lodash_1.default.uniq(trackDocs.map((t) => String(t._albumId)));
    const albumNameDocs = albumIds.length
        ? await Albums.find({ _albumId: { $in: albumIds.map((id) => new mongodb_1.ObjectId(id)) } }, { projection: { _albumId: 1, Album: 1 } }).toArray()
        : [];
    const albumNameMap = Object.fromEntries(albumNameDocs.map((a) => [String(a._albumId), a.Album]));
    return {
        albums: albumDocs.map((a) => ({
            _albumId: String(a._albumId),
            Album: a.Album,
            Type: a.Type,
            AlbumArtist: a.AlbumArtist,
            Year: a.Year
        })),
        tracks: trackDocs.map((t) => ({
            _trackId: String(t._trackId),
            _albumId: String(t._albumId),
            Title: t.Title,
            Artist: t.Artist,
            Duration: t.Duration,
            albumName: albumNameMap[String(t._albumId)] || ""
        }))
    };
};
exports.searchContent = searchContent;
const getAlbumById = async (request) => {
    var _a;
    const albumId = String((_a = request.query.albumId) !== null && _a !== void 0 ? _a : "").trim();
    if (!albumId || !mongodb_1.ObjectId.isValid(albumId)) {
        throw new Error("Valid albumId is required.");
    }
    const { Albums, Tracks } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const album = await Albums.findOne({
        _albumId: new mongodb_1.ObjectId(albumId)
    });
    if (!album) {
        throw new Error("Album not found.");
    }
    const tracks = await Tracks.find({
        _albumId: new mongodb_1.ObjectId(albumId)
    }).toArray();
    if (album.Type === "Album") {
        return {
            album: Object.assign(Object.assign({}, serializeAlbum(album)), { Tracks: tracks.map(serializeTrack) })
        };
    }
    const track = tracks[0];
    return {
        album: Object.assign(Object.assign({}, serializeAlbum(album)), (track ? serializeTrack(track) : {}))
    };
};
exports.getAlbumById = getAlbumById;
const getTrackById = async (request) => {
    var _a;
    const trackId = String((_a = request.query.trackId) !== null && _a !== void 0 ? _a : "").trim();
    if (!trackId || !mongodb_1.ObjectId.isValid(trackId)) {
        throw new Error("Valid trackId is required.");
    }
    const { Tracks } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const track = await Tracks.findOne({
        _trackId: new mongodb_1.ObjectId(trackId)
    });
    if (!track) {
        throw new Error("Track not found.");
    }
    return { track: serializeTrack(track) };
};
exports.getTrackById = getTrackById;
const updateAlbum = async (request) => {
    const body = request.body;
    if (!body._albumId || !mongodb_1.ObjectId.isValid(body._albumId)) {
        throw new Error("Valid _albumId is required.");
    }
    if (!body.Album || !body.AlbumArtist || !body.Year || !body.Color || !body.releaseDate || !body.Thumbnail || !body.Type) {
        throw new Error("Missing required album fields.");
    }
    if (body.Type !== "Album" && body.Type !== "Single") {
        throw new Error("Type must be Album or Single.");
    }
    const { Albums } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const existing = await Albums.findOne({
        _albumId: new mongodb_1.ObjectId(body._albumId)
    });
    if (!existing) {
        throw new Error("Album not found.");
    }
    const $set = {
        Album: body.Album,
        AlbumArtist: body.AlbumArtist,
        Year: body.Year,
        Color: body.Color,
        releaseDate: (0, moment_timezone_1.default)(body.releaseDate).format("YYYY-MM-DD"),
        Thumbnail: body.Thumbnail,
        Type: body.Type
    };
    const $unset = {};
    if (body.LightColor) {
        $set.LightColor = body.LightColor;
    }
    else {
        $unset.LightColor = "";
    }
    if (body.DarkColor) {
        $set.DarkColor = body.DarkColor;
    }
    else {
        $unset.DarkColor = "";
    }
    const update = { $set };
    if (Object.keys($unset).length) {
        update.$unset = $unset;
    }
    await Albums.updateOne({ _albumId: new mongodb_1.ObjectId(body._albumId) }, update);
    const updated = await Albums.findOne({
        _albumId: new mongodb_1.ObjectId(body._albumId)
    });
    return {
        message: "Album updated.",
        album: serializeAlbum(updated)
    };
};
exports.updateAlbum = updateAlbum;
const updateTrack = async (request) => {
    const body = request.body;
    if (!body._trackId || !mongodb_1.ObjectId.isValid(body._trackId)) {
        throw new Error("Valid _trackId is required.");
    }
    if (!body._albumId || !mongodb_1.ObjectId.isValid(body._albumId)) {
        throw new Error("Valid _albumId is required.");
    }
    if (!body.Title || !body.Artist || !body.url || !body.Duration) {
        throw new Error("Missing required track fields (_albumId, Title, Artist, url, Duration).");
    }
    const { Tracks } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const existing = await Tracks.findOne({
        _trackId: new mongodb_1.ObjectId(body._trackId)
    });
    if (!existing) {
        throw new Error("Track not found.");
    }
    const $set = {
        _albumId: new mongodb_1.ObjectId(body._albumId),
        Title: body.Title,
        Artist: body.Artist,
        url: body.url,
        Duration: body.Duration,
        streamCount: typeof body.streamCount === "number" ? body.streamCount : 0
    };
    const $unset = {};
    if (body.lyrics) {
        $set.lyrics = true;
    }
    else {
        $unset.lyrics = "";
    }
    if (body.sync) {
        $set.sync = true;
    }
    else {
        $unset.sync = "";
    }
    const update = { $set };
    if (Object.keys($unset).length) {
        update.$unset = $unset;
    }
    await Tracks.updateOne({ _trackId: new mongodb_1.ObjectId(body._trackId) }, update);
    const updated = await Tracks.findOne({
        _trackId: new mongodb_1.ObjectId(body._trackId)
    });
    return {
        message: "Track updated.",
        track: serializeTrack(updated)
    };
};
exports.updateTrack = updateTrack;
const serializeUser = (user) => {
    var _a;
    return ({
        _id: String(user._id),
        username: user.username,
        email: user.email,
        googleAccount: user.googleAccount,
        accountAccess: Object.assign(Object.assign({}, user.accountAccess), { timeLimit: user.accountAccess.timeLimit
                ? (0, moment_timezone_1.default)(user.accountAccess.timeLimit).toISOString()
                : null }),
        loggedIn: user.loggedIn,
        status: user.status,
        recentsLastModified: user.recentsLastModified
            ? (0, moment_timezone_1.default)(user.recentsLastModified).toISOString()
            : null,
        recentlyPlayed: (user.recentlyPlayed || []).map((each) => ({
            albumId: each.albumId,
            frequency: each.frequency,
            last: (0, moment_timezone_1.default)(each.last).toISOString()
        })),
        activeSessions: user.activeSessions || [],
        hasPassword: Boolean((_a = user.password) === null || _a === void 0 ? void 0 : _a.key),
        installedVersion: user.installedVersion
    });
};
const parseRecentlyPlayed = (items) => {
    if (!Array.isArray(items)) {
        throw new Error("recentlyPlayed must be an array.");
    }
    return items.map((item, index) => {
        if (!item || typeof item !== "object") {
            throw new Error(`recentlyPlayed[${index}] must be an object.`);
        }
        const { albumId, frequency, last } = item;
        if (!albumId || typeof albumId !== "string") {
            throw new Error(`recentlyPlayed[${index}].albumId is required.`);
        }
        if (typeof frequency !== "number" || frequency < 0) {
            throw new Error(`recentlyPlayed[${index}].frequency must be a non-negative number.`);
        }
        const lastDate = (0, moment_timezone_1.default)(last);
        if (!lastDate.isValid()) {
            throw new Error(`recentlyPlayed[${index}].last must be a valid date.`);
        }
        return {
            albumId,
            frequency,
            last: lastDate.toDate()
        };
    });
};
const parseActiveSessions = (items) => {
    if (!Array.isArray(items)) {
        throw new Error("activeSessions must be an array.");
    }
    return items.map((item, index) => {
        if (!item || typeof item !== "object") {
            throw new Error(`activeSessions[${index}] must be an object.`);
        }
        const { seen, device, sessionId, lastUsed } = item;
        if (typeof seen !== "boolean") {
            throw new Error(`activeSessions[${index}].seen must be a boolean.`);
        }
        if (device !== null && typeof device !== "string") {
            throw new Error(`activeSessions[${index}].device must be a string or null.`);
        }
        if (!sessionId || typeof sessionId !== "string") {
            throw new Error(`activeSessions[${index}].sessionId is required.`);
        }
        if (!lastUsed || typeof lastUsed !== "string") {
            throw new Error(`activeSessions[${index}].lastUsed is required.`);
        }
        return { seen, device, sessionId, lastUsed };
    });
};
const searchUsers = async (request) => {
    var _a, _b;
    const q = String((_b = (_a = request.query.q) !== null && _a !== void 0 ? _a : request.query.search) !== null && _b !== void 0 ? _b : "").trim();
    if (!q) {
        return { users: [] };
    }
    const { Users } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    const users = await Users.find({
        $or: [
            { username: regex },
            { "googleAccount.email": regex },
            { "googleAccount.name": regex },
            { "email.id": regex }
        ]
    }, {
        projection: {
            username: 1,
            googleAccount: 1,
            email: 1,
            status: 1,
            accountAccess: 1
        }
    })
        .sort({ "googleAccount.email": 1 })
        .limit(30)
        .toArray();
    return {
        users: users.map((user) => {
            var _a, _b, _c, _d;
            return ({
                _id: String(user._id),
                username: user.username,
                email: ((_a = user.googleAccount) === null || _a === void 0 ? void 0 : _a.email) || ((_b = user.email) === null || _b === void 0 ? void 0 : _b.id) || "",
                name: ((_c = user.googleAccount) === null || _c === void 0 ? void 0 : _c.name) || "",
                status: user.status,
                accessType: ((_d = user.accountAccess) === null || _d === void 0 ? void 0 : _d.type) || ""
            });
        })
    };
};
exports.searchUsers = searchUsers;
const getUserById = async (request) => {
    var _a;
    const userId = String((_a = request.query.userId) !== null && _a !== void 0 ? _a : "").trim();
    if (!userId || !mongodb_1.ObjectId.isValid(userId)) {
        throw new Error("Valid userId is required.");
    }
    const { Users } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const user = await Users.findOne({
        _id: new mongodb_1.ObjectId(userId)
    });
    if (!user) {
        throw new Error("User not found.");
    }
    return { user: serializeUser(user) };
};
exports.getUserById = getUserById;
const updateUser = async (request) => {
    var _a;
    const body = request.body;
    if (!body._id || !mongodb_1.ObjectId.isValid(body._id)) {
        throw new Error("Valid _id is required.");
    }
    if (typeof ((_a = body.accountAccess) === null || _a === void 0 ? void 0 : _a.duration) !== "number" || body.accountAccess.duration < 0) {
        throw new Error("accountAccess.duration must be a non-negative number (seconds).");
    }
    const recentlyPlayed = parseRecentlyPlayed(body.recentlyPlayed);
    const activeSessions = parseActiveSessions(body.activeSessions);
    const { Users } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const existing = await Users.findOne({
        _id: new mongodb_1.ObjectId(body._id)
    });
    if (!existing) {
        throw new Error("User not found.");
    }
    const durationChanged = body.accountAccess.duration !== existing.accountAccess.duration;
    const finalActiveSessions = durationChanged
        ? activeSessions.map((each) => (Object.assign(Object.assign({}, each), { seen: false })))
        : activeSessions;
    await Users.updateOne({ _id: new mongodb_1.ObjectId(body._id) }, {
        $set: {
            accountAccess: Object.assign(Object.assign({}, existing.accountAccess), { duration: body.accountAccess.duration, timeLimit: null }),
            recentlyPlayed,
            activeSessions: finalActiveSessions,
            recentsLastModified: (0, moment_timezone_1.default)().tz(utils_1.timezone).toDate()
        }
    });
    const updated = await Users.findOne({
        _id: new mongodb_1.ObjectId(body._id)
    });
    return {
        message: "User updated.",
        user: serializeUser(updated)
    };
};
exports.updateUser = updateUser;
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
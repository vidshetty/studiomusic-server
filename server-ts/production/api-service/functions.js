"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailApi = exports.demoVideosLink = exports.getOriginalResumeLink = exports.getLatestUpdate = exports.signOut = exports.getProfile = exports.activateCheck = exports.recordTime = exports.startRadio = exports.getLyrics = exports.removeFromRecentlyPlayed = exports.addToRecentlyPlayed = exports.search = exports.getAlbumDetails = exports.getTrackDetails = exports.getLibrary = exports.homeAlbums = exports.getTrack = exports.getAlbum = void 0;
const lodash_1 = __importDefault(require("lodash"));
const mongodb_1 = require("mongodb");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const path_1 = __importDefault(require("path"));
const nodemailer_service_1 = require("../nodemailer-service");
const utils_1 = require("../helpers/utils");
const latestUpdate_1 = require("../data/latestUpdate");
const mongodb_connection_1 = require("../helpers/mongodb-connection");
const compareRecents = (a, b) => {
    if (a.last < b.last)
        return 1;
    return -1;
};
const __distribute = (list, type) => {
    let obj = {}, times, songnum = 2, albumnum = 5, quicknum = 3, recentsnum = 3;
    if (type === "song") {
        let another = list.length > 8 ? list.slice(0, 8) : list;
        times = Math.ceil(another.length / songnum);
        for (let i = 0; i < times; i++) {
            obj[i] = another.slice(i * songnum, (i * songnum) + songnum);
        }
        return obj;
    }
    if (type === "album") {
        let another = list.length > 5 ? list.slice(0, 5) : list;
        times = Math.ceil(another.length / albumnum);
        for (let i = 0; i < times; i++) {
            obj[i] = another.slice(i * albumnum, (i * albumnum) + albumnum);
        }
        return obj;
    }
    if (type === "quick-pick") {
        times = Math.ceil(list.length / quicknum);
        for (let i = 0; i < times; i++) {
            obj[i] = list.slice(i * quicknum, (i * quicknum) + quicknum);
        }
        return obj;
    }
    if (type === "recents") {
        times = Math.ceil(list.length / recentsnum);
        for (let i = 0; i < times; i++) {
            obj[i] = list.slice(i * recentsnum, (i * recentsnum) + recentsnum);
        }
        return obj;
    }
    return { 1: list };
};
const inspectRecentlyPlayed = async (userId) => {
    const { Users } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    if (!userId)
        return;
    const user = await Users.findOne({
        _id: new mongodb_1.ObjectId(userId)
    });
    if (!user)
        return;
    const { recentlyPlayed } = user;
    let { recentsLastModified } = user;
    if (!recentsLastModified) {
        recentsLastModified = (0, moment_timezone_1.default)().subtract(1, "d").tz(utils_1.timezone).startOf("d").toDate();
    }
    let shouldModify = false;
    const time = moment_timezone_1.default.duration((0, moment_timezone_1.default)().tz(utils_1.timezone).diff((0, moment_timezone_1.default)(recentsLastModified)));
    const timeInDays = Math.floor(time.asDays());
    if (timeInDays > 0)
        shouldModify = true;
    const modifiedRecents = recentlyPlayed.reduce((acc, each) => {
        let { frequency = 0, last = "" } = each;
        const diff = moment_timezone_1.default.duration((0, moment_timezone_1.default)().tz(utils_1.timezone).diff((0, moment_timezone_1.default)(last)));
        const days = diff.asDays();
        if (days >= 7)
            return acc;
        if (frequency === 0)
            return acc;
        if (shouldModify && frequency - timeInDays > 0) {
            each.frequency = frequency - timeInDays;
        }
        if (each.frequency > 0)
            acc.push(each);
        return acc;
    }, []);
    Object.assign(user, {
        recentlyPlayed: modifiedRecents,
        recentsLastModified: shouldModify ?
            (0, moment_timezone_1.default)().tz(utils_1.timezone).startOf("d").toDate() :
            recentsLastModified
    });
    await Users.updateOne({ _id: new mongodb_1.ObjectId(user._id) }, { $set: user });
};
const getMostPlayed = async (userId) => {
    const { Users } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const user = await Users.findOne({
        _id: new mongodb_1.ObjectId(userId)
    });
    let { recentlyPlayed: recents = [] } = user;
    recents = recents.sort(compareRecents);
    recents = recents.slice(0, 6);
    if (recents.length < 6)
        return [];
    const { Albums, Tracks } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const db_albums = await Albums.find({
        _albumId: {
            $in: lodash_1.default.map(recents, e => new mongodb_1.ObjectId(e.albumId))
        }
    }).toArray();
    const db_tracks = await Tracks.find({
        _albumId: {
            $in: lodash_1.default.map(recents, e => new mongodb_1.ObjectId(e.albumId))
        }
    }).toArray();
    return recents.reduce((albums, each) => {
        const album = db_albums.find(a => String(a._albumId) === String(each.albumId));
        if (!album)
            return albums;
        const tracks = db_tracks.filter(t => String(t._albumId) === String(each.albumId));
        albums.push(...(0, utils_1.convertToAlbumListFromDB)([album], tracks));
        return albums;
    }, []);
};
const getQuickPicks = async () => {
    const { Albums, Tracks } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const tracks = await Tracks.aggregate([
        {
            $sample: { size: 12 }
        }
    ])
        .toArray();
    const albums = await Albums.find({
        _albumId: { $in: lodash_1.default.map(tracks, e => new mongodb_1.ObjectId(e._albumId)) }
    }).toArray();
    const albumList = (0, utils_1.convertToAlbumListFromDB)(albums, tracks);
    return albumList.reduce((list, album) => {
        if (album.Type === "Single")
            list.push(album);
        if (album.Type === "Album") {
            const dummy_album = album;
            dummy_album.Tracks.forEach(track => {
                const song = Object.assign(Object.assign({}, dummy_album), track);
                delete song.Tracks;
                list.push(song);
            });
        }
        return list;
    }, []);
};
const getNewReleases = async () => {
    const { Albums, Tracks } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const albums = await Albums
        .find({})
        .sort({ releaseDate: -1 })
        .limit(6)
        .toArray();
    const tracks = await Tracks.find({
        _albumId: { $in: lodash_1.default.map(albums, e => new mongodb_1.ObjectId(e._albumId)) }
    }).toArray();
    return (0, utils_1.convertToAlbumListFromDB)(albums, tracks);
};
const getRecentlyAdded = async (newReleases) => {
    const { Albums, Tracks } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const albums = await Albums
        .find({
        _albumId: { $nin: lodash_1.default.map(newReleases, e => new mongodb_1.ObjectId(e._albumId)) }
    })
        .sort({ _id: -1 })
        .limit(6)
        .toArray();
    const tracks = await Tracks.find({
        _albumId: { $in: lodash_1.default.map(albums, e => new mongodb_1.ObjectId(e._albumId)) }
    }).toArray();
    return (0, utils_1.convertToAlbumListFromDB)(albums, tracks);
};
const fetchSearchAlbumList = async (name) => {
    const regex = new RegExp(lodash_1.default.escapeRegExp(name), "i");
    const { Albums, Tracks } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const [trackMatches, albumMatches] = await Promise.all([
        Tracks.find({
            $or: [
                { Title: regex },
                { Artist: regex }
            ]
        }).toArray(),
        Albums.find({
            $or: [
                { Album: regex },
                { AlbumArtist: regex }
            ]
        }).toArray()
    ]);
    const allAlbumIds = lodash_1.default.uniqBy([
        ...lodash_1.default.map(trackMatches, t => new mongodb_1.ObjectId(t._albumId)),
        ...lodash_1.default.map(albumMatches, a => new mongodb_1.ObjectId(a._albumId))
    ], id => String(id));
    if (allAlbumIds.length === 0)
        return [];
    const [albums, tracks] = await Promise.all([
        Albums.find({
            _albumId: { $in: allAlbumIds }
        }).toArray(),
        Tracks.find({
            _albumId: { $in: allAlbumIds }
        }).toArray()
    ]);
    return (0, utils_1.convertToAlbumListFromDB)(albums, tracks);
};
const filterSearchSongs = (albumList, name) => {
    const lower = name.toLowerCase();
    return albumList.reduce((acc, song) => {
        const album = song;
        const single = song;
        if (song.Type === "Album") {
            for (let track of album.Tracks) {
                const inTitle = track.Title.toLowerCase().includes(lower);
                if (inTitle) {
                    const obj = Object.assign(Object.assign({}, track), album);
                    obj.Tracks = [];
                    acc.push(obj);
                    continue;
                }
                const inArtist = track.Artist.toLowerCase().includes(lower);
                if (inArtist) {
                    const obj = Object.assign(Object.assign({}, track), album);
                    obj.Tracks = [];
                    acc.push(obj);
                }
            }
            return acc;
        }
        if (song.Type === "Single") {
            const inAlbum = single.Album.toLowerCase().includes(lower);
            if (inAlbum) {
                acc.push(single);
                return acc;
            }
            const inArtist = single.Artist.toLowerCase().includes(lower);
            if (inArtist) {
                acc.push(single);
            }
            return acc;
        }
        return acc;
    }, []);
};
const filterSearchAlbums = (albumList, name) => {
    const lower = name.toLowerCase();
    return albumList.reduce((acc, song) => {
        const album = song;
        const single = song;
        if (song.Type === "Album") {
            let isInAlbum = false, isInTracks = false, isInAlbumArtist = false;
            for (let track of album.Tracks) {
                const inTitle = track.Title.toLowerCase().includes(lower);
                if (inTitle) {
                    isInTracks = true;
                    break;
                }
            }
            if (song.Album.toLowerCase().includes(lower))
                isInAlbum = true;
            if (song.AlbumArtist.toLowerCase().includes(lower))
                isInAlbumArtist = true;
            if (isInAlbum || isInTracks || isInAlbumArtist)
                acc.push(album);
            return acc;
        }
        if (song.Type === "Single") {
            const inAlbum = single.Album.toLowerCase().includes(lower);
            const inAlbumArtist = single.AlbumArtist.toLowerCase().includes(lower);
            if (inAlbum || inAlbumArtist)
                acc.push(single);
            return acc;
        }
        return acc;
    }, []);
};
const __qr = async (toBeExcluded) => {
    const { Albums, Tracks } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const tracks = await Tracks.aggregate([
        {
            $match: {
                $expr: {
                    $and: [
                        { $ne: ["$_albumId", new mongodb_1.ObjectId(toBeExcluded)] },
                        { $ne: ["$_trackId", new mongodb_1.ObjectId(toBeExcluded)] }
                    ]
                }
            }
        },
        {
            $sample: { size: 80 }
        }
    ]).toArray();
    const albums = await Albums.find({
        _albumId: { $in: lodash_1.default.map(tracks, e => new mongodb_1.ObjectId(e._albumId)) }
    }).toArray();
    const albumList = (0, utils_1.convertToAlbumListFromDB)(albums, tracks);
    return albumList.reduce((list, song) => {
        const album = song;
        const single = song;
        if (single.Type === "Single")
            list.push(single);
        if (album.Type === "Album") {
            album.Tracks.forEach(track => {
                const obj = Object.assign(Object.assign({}, album), track);
                obj.Tracks = [];
                list.push(obj);
            });
        }
        return list;
    }, []);
};
const __rp = async (toBeExcluded, userId) => {
    const { Users, Albums, Tracks } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const user = await Users.findOne({
        _id: new mongodb_1.ObjectId(userId)
    });
    if (lodash_1.default.isEmpty(user))
        return [];
    const { recentlyPlayed = [] } = user;
    const recentlyPlayedAlbumIds = lodash_1.default.map(recentlyPlayed, each => String(each.albumId));
    const albumsFromDb = await Albums.find({
        _albumId: { $in: lodash_1.default.map(recentlyPlayedAlbumIds, e => new mongodb_1.ObjectId(e)) }
    }).toArray();
    const tracksFromDb = await Tracks.find({
        _albumId: { $in: lodash_1.default.map(albumsFromDb, e => new mongodb_1.ObjectId(e._albumId)) }
    }).toArray();
    const albumList = (0, utils_1.convertToAlbumListFromDB)(albumsFromDb, tracksFromDb);
    const albums = albumList.reduce((list, song) => {
        const album = song;
        const single = song;
        if (String(album._albumId) === toBeExcluded)
            return list;
        if (single.Type === "Single")
            list.push(single);
        if (album.Type === "Album") {
            album.Tracks.forEach(t => {
                if (String(t._trackId) === toBeExcluded)
                    return;
                const obj = Object.assign(Object.assign({}, album), t);
                obj.Tracks = [];
                list.push(obj);
            });
        }
        return list;
    }, []);
    const len = albums.length;
    const final = [];
    const randomNumberCounter = {};
    let done;
    for (let i = 0; i < 40; i++) {
        done = false;
        let limit = 3;
        while (!done) {
            if (limit === 0)
                break;
            else
                limit--;
            const rand = Math.floor(Math.random() * len);
            if (!randomNumberCounter[rand]) {
                final.push(albums[rand]);
                randomNumberCounter[rand] = true;
                done = true;
            }
        }
    }
    ;
    return final;
};
const __notifyOfAccessingLinks = async () => {
    try {
        const options = {
            to: "toriumcar@gmail.com",
            subject: "Drive Link Accessed",
            html: "Someone accessed your drive link!"
        };
        await (0, nodemailer_service_1.sendEmail)(options);
    }
    catch (e) {
        console.log("error sending email to admin on drive access", e);
    }
};
const __notifyOfAccessingCustomResumeLinks = async (name, linkType) => {
    try {
        const options = {
            to: "toriumcar@gmail.com",
            subject: `${name} - ${linkType} accessed!`,
            html: "Someone accessed your custom link!"
        };
        await (0, nodemailer_service_1.sendEmail)(options);
    }
    catch (e) {
        console.log("error sending email to admin on custom link access", e);
    }
};
const getAlbum = async (request) => {
    const { albumId } = request.query;
    if (!albumId)
        return null;
    const { Albums, Tracks } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const album = await Albums.findOne({
        _albumId: new mongodb_1.ObjectId(albumId)
    });
    const tracks = await Tracks.find({
        _albumId: new mongodb_1.ObjectId(albumId)
    })
        .toArray();
    if (album.Type === "Album") {
        album.Tracks = tracks;
        return album;
    }
    else {
        return Object.assign(Object.assign({}, album), ((tracks === null || tracks === void 0 ? void 0 : tracks[0]) || {}));
    }
};
exports.getAlbum = getAlbum;
const getTrack = async (request) => {
    const { Albums, Tracks } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const { trackId } = request.query;
    if (lodash_1.default.isEmpty(trackId))
        return null;
    const track = await Tracks.findOne({
        _trackId: new mongodb_1.ObjectId(trackId)
    });
    if (lodash_1.default.isEmpty(track))
        return null;
    const album = await Albums.findOne({
        _albumId: new mongodb_1.ObjectId(track._albumId)
    });
    if (lodash_1.default.isEmpty(album))
        return null;
    const finalTrack = Object.assign(Object.assign({}, (() => {
        delete track._id;
        return track;
    })()), (() => {
        delete album._id;
        return album;
    })());
    return finalTrack;
    // const { albumId, trackId }: RequestQuery = request.query as unknown as RequestQuery;
    // console.log("query", albumId, trackId);
    // if (!albumId || !trackId) return null;
    // const album = ALBUMLIST.find(each => each._albumId === albumId);
    // if (!album) return null;
    // let track = null;
    // if (album.Type === "Single") {
    //     track = { ...(album as Single) };
    // }
    // else if (album.Type === "Album") {
    //     (album as Album).Tracks.forEach(t => {
    //         if (String(t._trackId) !== trackId) return;
    //         track = { ...(album as Album), ...t };
    //         track.Tracks = [];
    //     });
    // }
    // return track;
};
exports.getTrack = getTrack;
const homeAlbums = async (request, _) => {
    const { id: userId } = request.ACCOUNT;
    const mostPlayed = await getMostPlayed(userId);
    const homeList = {};
    homeList["New Releases"] = await getNewReleases();
    homeList["Recently Added"] = await getRecentlyAdded(homeList["New Releases"]);
    return { albums: homeList, mostPlayed, quickPicks: await getQuickPicks() };
};
exports.homeAlbums = homeAlbums;
const getLibrary = async (request, response) => {
    const { page } = request.query;
    const start = parseInt(page || "1") - 1;
    const no = 7 * 7;
    const { Albums, Tracks } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const albums = await Albums.find().sort({ _id: 1 }).toArray();
    const tracks = await Tracks.find().sort({ _id: 1 }).toArray();
    const albumList = (0, utils_1.convertToAlbumListFromDB)(albums, tracks);
    const arr = lodash_1.default.map(albumList, (e, i) => {
        e.keyId = i;
        return e;
    });
    const sublibrary = arr.slice(start * no, (start * no) + no);
    const random = (0, utils_1.randomize)(sublibrary);
    let result;
    if ((start * no) + no === arr.length || sublibrary.length < no) {
        result = { more: false, data: random };
    }
    else {
        result = { more: true, data: random };
    }
    return result;
};
exports.getLibrary = getLibrary;
const getTrackDetails = async (request, _) => {
    return { track: await (0, exports.getTrack)(request) };
};
exports.getTrackDetails = getTrackDetails;
const getAlbumDetails = async (request, _) => {
    return { album: await (0, exports.getAlbum)(request) };
};
exports.getAlbumDetails = getAlbumDetails;
const search = async (request, _) => {
    const { name } = request.query;
    if (!name)
        return { songs: [], albums: [], artists: [] };
    const albumList = await fetchSearchAlbumList(name);
    return {
        songs: filterSearchSongs(albumList, name),
        albums: filterSearchAlbums(albumList, name),
        artists: []
    };
};
exports.search = search;
const addToRecentlyPlayed = async (request) => {
    const { Users } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const { id: userId } = request.ACCOUNT;
    const { albumId, trackId } = request.body;
    const user = await Users.findOne({
        _id: new mongodb_1.ObjectId(userId)
    });
    if (!user)
        return;
    const { recentlyPlayed: recents } = user;
    const index = recents.findIndex(each => each.albumId === albumId);
    if (index === -1) {
        recents.push({ albumId, frequency: 1, last: (0, moment_timezone_1.default)().tz(utils_1.timezone).toDate() });
    }
    else {
        recents[index].frequency++;
        recents[index].last = (0, moment_timezone_1.default)().tz(utils_1.timezone).toDate();
    }
    Object.assign(user, { recentlyPlayed: recents });
    await Users.updateOne({ _id: new mongodb_1.ObjectId(user._id) }, { $set: user });
    const { Tracks } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    await Tracks.updateOne({
        _trackId: lodash_1.default.isEmpty(trackId) ?
            (lodash_1.default.isEmpty(albumId) ? null : new mongodb_1.ObjectId(albumId)) :
            new mongodb_1.ObjectId(trackId)
    }, { $inc: { streamCount: 1 } });
    return;
};
exports.addToRecentlyPlayed = addToRecentlyPlayed;
const removeFromRecentlyPlayed = async (request, _) => {
    const { Users } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const { id: userId } = request.ACCOUNT;
    const { albumId } = request.body;
    const user = await Users.findOne({
        _id: new mongodb_1.ObjectId(userId)
    });
    if (!user)
        return;
    const { recentlyPlayed: recents } = user;
    const index = recents.findIndex(each => each.albumId === albumId);
    if (index > -1) {
        recents.splice(index, 1);
        Object.assign(user, { recentlyPlayed: recents });
        await Users.updateOne({ _id: new mongodb_1.ObjectId(user._id) }, { $set: user });
    }
    return;
};
exports.removeFromRecentlyPlayed = removeFromRecentlyPlayed;
const getLyrics = async (request, _) => {
    let { name } = request.query;
    name = (0, utils_1.__replace)(name, ['"', ':'], "");
    const fileName = path_1.default.join(process.cwd(), "data", "lyrics", "json", `${name}.json`);
    try {
        const data = JSON.parse(await (0, utils_1.readFileAsync)(fileName));
        const list = data.map((each, i) => {
            each.key = i;
            return each;
        });
        return list;
    }
    catch (e) {
        return [];
    }
    // try {
    //     let data: string = fs.readFileSync(fileName, { encoding: "utf-8" });
    //     data = data.replace(/\r\n/g,"");
    //     let arr: string[] = data.split(";");
    //     arr.splice(data.length-1,1);
    //     const list = arr.map<Lyrics>((each: string, i: number) => {
    //         const obj: Lyrics = {
    //             from: 0, to: 0, text: "", key: 0
    //         };
    //         const [numbers, lyric] = each.split(":");
    //         obj.from = parseFloat(numbers.split("-")[0]);
    //         obj.to = parseFloat(numbers.split("-")[1]);
    //         obj.text = lyric;
    //         obj.key = i;
    //         return obj;
    //     });
    //     return list;
    // }
    // catch(e) {
    //     return [];
    // }
};
exports.getLyrics = getLyrics;
const startRadio = async (request, _) => {
    const { exclude: toBeExcluded = "", type } = request.query;
    const { id: userId } = request.ACCOUNT;
    let finalArr = [];
    if (type === "qr") {
        finalArr = await __qr(toBeExcluded);
    }
    else if (type === "rp") {
        finalArr = await __rp(toBeExcluded, userId);
    }
    return finalArr;
};
exports.startRadio = startRadio;
const recordTime = async (request, _) => {
    const { id: userId } = request.ACCOUNT;
    // const user: UserInterface = await Users.findOne({ _id: userId });
    // Object.assign(user,{
    //     lastUsed: getCurrentTime()
    // });
    // await user.save();
    return;
};
exports.recordTime = recordTime;
const activateCheck = async (request, _) => {
    const { id: userId } = request.ACCOUNT;
    inspectRecentlyPlayed(userId);
    return { status: "active", server: utils_1.server };
};
exports.activateCheck = activateCheck;
const getProfile = async (request, _res) => {
    const { Users } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const { id: userId } = request.ACCOUNT;
    const { from = "" } = request.query;
    const user = await Users.findOne({
        _id: new mongodb_1.ObjectId(userId)
    });
    if (!user)
        return {};
    const { googleAccount, accountAccess } = user;
    if (from !== "auth") {
        return {
            name: user.username,
            email: googleAccount.email,
            picture: googleAccount.picture,
            limit: (0, moment_timezone_1.default)(accountAccess.timeLimit).tz(utils_1.timezone).format("DD MMMM YYYY hh:mm A")
        };
    }
    const { recentlyPlayed = [] } = user;
    const recents = recentlyPlayed.sort(compareRecents).slice(0, 6);
    const { Albums, Tracks } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const db_albums = await Albums.find({
        _albumId: {
            $in: lodash_1.default.map(recents, e => new mongodb_1.ObjectId(e.albumId))
        }
    }).toArray();
    const db_tracks = await Tracks.find({
        _albumId: {
            $in: lodash_1.default.map(recents, e => new mongodb_1.ObjectId(e.albumId))
        }
    }).toArray();
    const list = recents.reduce((acc, each) => {
        const album = db_albums.find(a => String(a._albumId) === String(each.albumId));
        if (!album)
            return acc;
        const tracks = db_tracks.filter(t => String(t._albumId) === String(each.albumId));
        acc.push(...(0, utils_1.convertToAlbumListFromDB)([album], tracks));
        return acc;
    }, []);
    const dist = __distribute(list, "recents");
    const res = JSON.parse(JSON.stringify(user));
    res.recentlyPlayed = dist;
    return { found: true, user: res };
};
exports.getProfile = getProfile;
const signOut = async (request, response) => {
    const { Users } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const { ACCOUNT, result } = request;
    const { sessionId = null } = result;
    const user = await Users.findOne({
        _id: new mongodb_1.ObjectId(ACCOUNT.id)
    });
    if (!user)
        return { success: false };
    const { activeSessions = [] } = user;
    Object.assign(user, {
        activeSessions: activeSessions.filter(each => {
            return each.sessionId !== sessionId;
        })
    });
    await Users.updateOne({ _id: new mongodb_1.ObjectId(user._id) }, { $set: user });
    response.clearCookie("ACCOUNT", utils_1.standardCookieConfig);
    response.clearCookie("ACCOUNT_REFRESH", utils_1.standardCookieConfig);
    response.clearCookie("REDIRECT_URI", utils_1.redirectUriCookieConfig);
    return { success: true };
};
exports.signOut = signOut;
const getLatestUpdate = async (request, _) => {
    const latest = latestUpdate_1.LATEST_APP_UPDATE.RELEASE;
    return {
        versionCode: latest.versionCode,
        versionName: latest.versionName
    };
};
exports.getLatestUpdate = getLatestUpdate;
const getOriginalResumeLink = async (req, res) => {
    try {
        const { id = null, linkType = null } = ((req === null || req === void 0 ? void 0 : req.params) || {});
        if (lodash_1.default.isEmpty(id) ||
            !Object.keys(utils_1.defaultResumeLinks).includes(linkType || "")) {
            throw new Error("invalid url!");
        }
        const { ResumeConfigs } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
        const config = await ResumeConfigs.findOne({
            _id: new mongodb_1.ObjectId(id)
        });
        if (lodash_1.default.isEmpty(config)) {
            throw new Error("no config found, invalid id!");
        }
        const u = await ResumeConfigs.updateOne({ _id: new mongodb_1.ObjectId(config._id) }, {
            $push: {
                entries: {
                    $each: [{
                            linkType,
                            date: (0, moment_timezone_1.default)().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
                        }]
                }
            }
        });
        const orig_link = utils_1.defaultResumeLinks[linkType];
        __notifyOfAccessingCustomResumeLinks(config.name, linkType);
        res.redirect(orig_link);
    }
    catch (e) {
        console.log("error in resume link", e);
        res.status(404).end();
    }
};
exports.getOriginalResumeLink = getOriginalResumeLink;
const demoVideosLink = async (_, res) => {
    const drive_url = process.env.DRIVE_LINK || null;
    if (drive_url === null)
        return res.status(404).end();
    __notifyOfAccessingLinks();
    return res.redirect(drive_url);
};
exports.demoVideosLink = demoVideosLink;
const sendEmailApi = async (req, res) => {
    const { to = "", subject = "", message = "" } = req.body;
    const options = {
        to,
        subject,
        html: message
    };
    return await (0, nodemailer_service_1.sendEmail)(options);
};
exports.sendEmailApi = sendEmailApi;
//# sourceMappingURL=functions.js.map
import { Request, Response } from "express";
import moment from "moment-timezone";
import path from "path";
import _ from "lodash";
import { ObjectId } from "mongodb";
import {
    AlbumList,
    Album,
    Single,
    SpotifyLyrics,
    ActiveSession,
    RecentlyPlayed
} from "../helpers/interfaces";
import { sendEmail } from "../nodemailer-service";
import ALBUMLIST from "../data/archiveGateway";
import SONGLIST2 from "../data/songlist2";
import {
    timezone,
    calcPeriod,
    ejsRender,
    buildroot,
    readFileAsync,
    writeFileAsync,
    __replace,
    defaultUserId
} from "../helpers/utils";
import { MongoStudioHandler } from "../helpers/mongodb-connection";
import { AlbumSchema, TracksSchema, UserSchema } from "../helpers/schema";


interface updateBody {
    email?: string;
    sendEmail?: boolean;
    duration: string | number;
    seen: boolean;
    type: string;
}

interface RequestQuery {
    name?: string;
    id?: string | string[];
}

const emailUser = async (user: UserSchema) => {

    try {

        const { accountAccess, googleAccount } = user;
        const { duration = 0 } = accountAccess;
        const today = moment().tz(timezone);
        const addedToday = moment(today).add(duration,"s");
        const dur = moment.duration(moment(addedToday).diff(moment(today)));

        const period = calcPeriod(dur);
        const date = moment(addedToday).format("DD MMMM YYYY");
        const time = moment(addedToday).format("hh:mm A");

        const data = await ejsRender(
            path.join(process.cwd(), buildroot, "views", "accessextended.ejs"),
            { 
                period,
                date,
                time
            }
        );

        const options = {
            to: googleAccount.email,
            subject: "Access Extended",
            html: data
        };

        try {
            await sendEmail(options);
            return true;
        } catch(e) {
            console.log("e",e);
            return false;
        }

    } catch(e) {
        console.log("e",e);
        return false;
    }

};



export const update = async (request: Request, response: Response) => {

    const { Users } = MongoStudioHandler.getCollectionSet();

    const body: updateBody = {
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
        const time: string[] = (body.duration as string).split("*");
        const secs = time.reduce<number>((acc, each) => acc * parseFloat(each), 1);
        body.duration = secs;
    }

    const user = await Users.findOne({
        "googleAccount.email": email
    }) as UserSchema | null;

    if (!user) return { msg: "No such user." };

    const { accountAccess, activeSessions = [] } = user;

    Object.assign(user, {
        accountAccess: {
            ...accountAccess,
            ...body,
            timeLimit: null
        },
        activeSessions: _.map(activeSessions, (each: ActiveSession) => {
            each.seen = false;
            return each;
        })
    });

    await Users.updateOne(
        { _id: new ObjectId(user._id) },
        { $set: user }
    );

    if (sendEmail) {
        const sent = await emailUser(user);
        return { user, sent };
    }

    return { user, sent: false };

};

export const getUser = async (_:any, _1:any) => {

    const { Users } = MongoStudioHandler.getCollectionSet();

    const user = await Users.findOne({
        _id: new ObjectId(defaultUserId)
    }) as UserSchema | null;

    if (!user) return {};

    return {
        length: user.recentlyPlayed.length,
        recentlyPlayed: user.recentlyPlayed,
        recentsLastModified: user.recentsLastModified
    };

};

export const getAlbum = async (request: Request, _:any) => {

    const { name }: RequestQuery = request.query as unknown as RequestQuery;

    if (!name) return [];

    return ALBUMLIST.reduce<AlbumList[]>((acc,each) => {

        const album = each as Album;
        const single = each as Single;

        if (each.Type === "Single") {
            if (single.Album.toLowerCase().includes(name.toLowerCase())) {
                acc.push(single);
            }
        }

        if (each.Type === "Album") {
            if (album.Album.toLowerCase().includes(name.toLowerCase())) {
                acc.push(album);
            } else {
                for (let i=0; i<album.Tracks.length; i++) {
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

export const deleteAlbumFromRecents = async (request: Request) => {

    const { Users } = MongoStudioHandler.getCollectionSet();

    const { id } = request.query as unknown as { id: string | string[] | undefined; };

    if (_.isEmpty(id)) return false;

    const allIds = (_.isArray(id) ? id : [id]) as string[];

    const allUsers = await Users.find({}).toArray() as UserSchema[];

    for (let i=0; i<allUsers.length; i++) {

        const { recentlyPlayed: recents, _id: userId } = allUsers[i];

        const toBeRemoved = recents.reduce<string[]>((acc,each) => {
            const albumId: string = each.albumId;
            if (allIds.includes(albumId)) acc.push(albumId);
            return acc;
        }, []);

        if (toBeRemoved.length > 0) {
            // await Users.updateOne(
            //     { _id: userId },
            //     { $pull: { recentlyPlayed: { albumId: { $in: toBeRemoved } } } }
            // );
            await Users.updateOne(
                { _id: new ObjectId(userId) },
                {
                    $set: {
                        recentlyPlayed: _.filter(recents, e => {
                            return !toBeRemoved.includes(e.albumId);
                        })
                    }
                }
            );
        }

    }

    return true;

};

export const fixJson = async (request: Request, _:any) => {

    let { name } = request.query as any;
    name = __replace(name, ['"',':'], "");

    const fileName: string = path.join(
        process.cwd(),
        "data",
        "lyrics",
        "json",
        `${name}.json`
    );

    try {

        const data: SpotifyLyrics[] = JSON.parse(await readFileAsync(fileName));

        const list = data.map<SpotifyLyrics>((each: SpotifyLyrics) => {
            const startTimeMs = parseInt(`${each.startTimeMs}`);
            return { startTimeMs, words: each.words, key: each.key };
        });

        await writeFileAsync(fileName, JSON.stringify(list));

        return {
            done: true
        };

    }
    catch(e) {
        if (e instanceof Error) {
            return {
                name: e.name,
                msg: e.message
            };
        }
    }

};

export const albumsInsert = async () => {

    const { Albums, Tracks } = MongoStudioHandler.getCollectionSet();

    console.log("TOTAL", ALBUMLIST.length);

    for (let i=0; i<ALBUMLIST.length; i++) {

        console.log(i+1);

        const each = ALBUMLIST[i];

        if (each.Type === "Single") {

            const single = each as Single;

            const new_album: AlbumSchema = {
                _id: new ObjectId(),
                _albumId: new ObjectId(single._albumId),
                Album: single.Album,
                AlbumArtist: single.AlbumArtist,
                Year: single.Year,
                Color: single.Color,
                releaseDate: moment(single.releaseDate).format("YYYY-MM-DD"),
                Thumbnail: single.Thumbnail,
                Type: "Single",
                ...(() => {
                    const obj: { LightColor?: string; DarkColor?: string } = {};
                    if (single.LightColor) obj.LightColor = single.LightColor;
                    if (single.DarkColor) obj.DarkColor = single.DarkColor;
                    return obj;
                })()
            };

            const new_track: TracksSchema = {
                _id: new ObjectId(),
                _albumId: new ObjectId(single._albumId),
                _trackId: new ObjectId(single._trackId),
                Title: single.Album,
                Artist: single.Artist,
                url: single.url,
                Duration: single.Duration,
                ...(() => {
                    const obj: { lyrics?: boolean; sync?: boolean; } = {};
                    if (single.lyrics) obj.lyrics = single.lyrics;
                    if (single.sync) obj.sync = single.sync;
                    return obj;
                })(),
                streamCount: 0
            };

            await Albums.insertOne(new_album);
            await Tracks.insertOne(new_track);

        }
        else if (each.Type === "Album") {

            const album = each as Album;

            const new_album: AlbumSchema = {
                _id: new ObjectId(),
                _albumId: new ObjectId(album._albumId),
                Album: album.Album,
                AlbumArtist: album.AlbumArtist,
                Year: album.Year,
                Color: album.Color,
                releaseDate: moment(album.releaseDate).format("YYYY-MM-DD"),
                Thumbnail: album.Thumbnail,
                Type: "Album",
                ...(() => {
                    const obj: { LightColor?: string; DarkColor?: string } = {};
                    if (album.LightColor) obj.LightColor = album.LightColor;
                    if (album.DarkColor) obj.DarkColor = album.DarkColor;
                    return obj;
                })()
            };

            await Albums.insertOne(new_album);

            for (let t=0; t<album.Tracks.length; t++) {

                const track = album.Tracks[t];

                const new_track: TracksSchema = {
                    _id: new ObjectId(),
                    _albumId: new ObjectId(album._albumId),
                    _trackId: new ObjectId(track._trackId),
                    Title: track.Title,
                    Artist: track.Artist,
                    url: track.url,
                    Duration: track.Duration,
                    ...(() => {
                        const obj: { lyrics?: boolean; sync?: boolean; } = {};
                        if (track.lyrics) obj.lyrics = track.lyrics;
                        if (track.sync) obj.sync = track.sync;
                        return obj;
                    })(),
                    streamCount: 0
                };

                await Tracks.insertOne(new_track);

            }

        }

        console.log("-------------------");

    }

};

const serializeAlbum = (album: AlbumSchema) => ({
    ...album,
    _id: String(album._id),
    _albumId: String(album._albumId)
});

const serializeTrack = (track: TracksSchema) => ({
    ...track,
    _id: String(track._id),
    _albumId: String(track._albumId),
    _trackId: String(track._trackId)
});

export const listAlbums = async (request: Request) => {
    const q = String(request.query.q ?? request.query.search ?? "").trim();

    if (!q) {
        return [];
    }

    const { Albums } = MongoStudioHandler.getCollectionSet();
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");

    const albums = await Albums.find(
        { Album: regex },
        { projection: { _albumId: 1, Album: 1, Type: 1, AlbumArtist: 1, Year: 1 } }
    )
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

export const createAlbum = async (request: Request) => {

    const body = request.body as Partial<AlbumSchema> & { _albumId?: string };

    if (!body.Album || !body.AlbumArtist || !body.Year || !body.Color || !body.releaseDate || !body.Thumbnail || !body.Type) {
        throw new Error("Missing required album fields.");
    }

    if (body.Type !== "Album" && body.Type !== "Single") {
        throw new Error("Type must be Album or Single.");
    }

    if (!body._albumId || !ObjectId.isValid(body._albumId)) {
        throw new Error("Valid _albumId is required.");
    }

    const { Albums } = MongoStudioHandler.getCollectionSet();

    const new_album: AlbumSchema = {
        _id: new ObjectId(),
        _albumId: new ObjectId(body._albumId),
        Album: body.Album,
        AlbumArtist: body.AlbumArtist,
        Year: body.Year,
        Color: body.Color,
        releaseDate: moment(body.releaseDate).format("YYYY-MM-DD"),
        Thumbnail: body.Thumbnail,
        Type: body.Type,
        ...(() => {
            const obj: { LightColor?: string; DarkColor?: string } = {};
            if (body.LightColor) obj.LightColor = body.LightColor;
            if (body.DarkColor) obj.DarkColor = body.DarkColor;
            return obj;
        })()
    };

    await Albums.insertOne(new_album);

    return {
        message: "Album created.",
        album: serializeAlbum(new_album)
    };

};

export const createTrack = async (request: Request) => {

    const body = request.body as Partial<TracksSchema> & {
        _albumId?: string;
        _trackId?: string;
    };

    if (!body._albumId || !body.Title || !body.Artist || !body.url || !body.Duration) {
        throw new Error("Missing required track fields (_albumId, Title, Artist, url, Duration).");
    }

    if (!ObjectId.isValid(body._albumId)) {
        throw new Error("Valid _albumId is required.");
    }

    if (!body._trackId || !ObjectId.isValid(body._trackId)) {
        throw new Error("Valid _trackId is required.");
    }

    const { Tracks } = MongoStudioHandler.getCollectionSet();

    const new_track: TracksSchema = {
        _id: new ObjectId(),
        _albumId: new ObjectId(body._albumId),
        _trackId: new ObjectId(body._trackId),
        Title: body.Title,
        Artist: body.Artist,
        url: body.url,
        Duration: body.Duration,
        streamCount: typeof body.streamCount === "number" ? body.streamCount : 0,
        ...(() => {
            const obj: { lyrics?: boolean; sync?: boolean } = {};
            if (body.lyrics) obj.lyrics = true;
            if (body.sync) obj.sync = true;
            return obj;
        })()
    };

    await Tracks.insertOne(new_track);

    return {
        message: "Track created.",
        track: serializeTrack(new_track)
    };

};

export const generateAlbumId = async () => ({
    objectId: new ObjectId().toHexString()
});

export const generateTrackId = async () => ({
    objectId: new ObjectId().toHexString()
});

export const searchContent = async (request: Request) => {
    const q = String(request.query.q ?? request.query.search ?? "").trim();

    if (!q) {
        return { albums: [], tracks: [] };
    }

    const { Albums, Tracks } = MongoStudioHandler.getCollectionSet();
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");

    const [albumDocs, trackDocs] = await Promise.all([
        Albums.find(
            { $or: [{ Album: regex }, { AlbumArtist: regex }] },
            { projection: { _albumId: 1, Album: 1, Type: 1, AlbumArtist: 1, Year: 1 } }
        )
            .sort({ Album: 1 })
            .limit(30)
            .toArray(),
        Tracks.find(
            { $or: [{ Title: regex }, { Artist: regex }] },
            { projection: { _trackId: 1, _albumId: 1, Title: 1, Artist: 1, Duration: 1 } }
        )
            .sort({ Title: 1 })
            .limit(30)
            .toArray()
    ]);

    const albumIds = _.uniq(trackDocs.map((t) => String(t._albumId)));
    const albumNameDocs = albumIds.length
        ? await Albums.find(
            { _albumId: { $in: albumIds.map((id) => new ObjectId(id)) } },
            { projection: { _albumId: 1, Album: 1 } }
        ).toArray()
        : [];

    const albumNameMap = Object.fromEntries(
        albumNameDocs.map((a) => [String(a._albumId), a.Album])
    );

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

export const getAlbumById = async (request: Request) => {
    const albumId = String(request.query.albumId ?? "").trim();

    if (!albumId || !ObjectId.isValid(albumId)) {
        throw new Error("Valid albumId is required.");
    }

    const { Albums, Tracks } = MongoStudioHandler.getCollectionSet();

    const album = await Albums.findOne({
        _albumId: new ObjectId(albumId)
    }) as AlbumSchema | null;

    if (!album) {
        throw new Error("Album not found.");
    }

    const tracks = await Tracks.find({
        _albumId: new ObjectId(albumId)
    }).toArray() as TracksSchema[];

    if (album.Type === "Album") {
        return {
            album: {
                ...serializeAlbum(album),
                Tracks: tracks.map(serializeTrack)
            }
        };
    }

    const track = tracks[0];
    return {
        album: {
            ...serializeAlbum(album),
            ...(track ? serializeTrack(track) : {})
        }
    };
};

export const getTrackById = async (request: Request) => {
    const trackId = String(request.query.trackId ?? "").trim();

    if (!trackId || !ObjectId.isValid(trackId)) {
        throw new Error("Valid trackId is required.");
    }

    const { Tracks } = MongoStudioHandler.getCollectionSet();

    const track = await Tracks.findOne({
        _trackId: new ObjectId(trackId)
    }) as TracksSchema | null;

    if (!track) {
        throw new Error("Track not found.");
    }

    return { track: serializeTrack(track) };
};

export const updateAlbum = async (request: Request) => {
    const body = request.body as Partial<AlbumSchema> & { _albumId?: string };

    if (!body._albumId || !ObjectId.isValid(body._albumId)) {
        throw new Error("Valid _albumId is required.");
    }

    if (!body.Album || !body.AlbumArtist || !body.Year || !body.Color || !body.releaseDate || !body.Thumbnail || !body.Type) {
        throw new Error("Missing required album fields.");
    }

    if (body.Type !== "Album" && body.Type !== "Single") {
        throw new Error("Type must be Album or Single.");
    }

    const { Albums } = MongoStudioHandler.getCollectionSet();

    const existing = await Albums.findOne({
        _albumId: new ObjectId(body._albumId)
    });

    if (!existing) {
        throw new Error("Album not found.");
    }

    const $set: Partial<AlbumSchema> = {
        Album: body.Album,
        AlbumArtist: body.AlbumArtist,
        Year: body.Year,
        Color: body.Color,
        releaseDate: moment(body.releaseDate).format("YYYY-MM-DD"),
        Thumbnail: body.Thumbnail,
        Type: body.Type
    };

    const $unset: Record<string, ""> = {};

    if (body.LightColor) {
        $set.LightColor = body.LightColor;
    } else {
        $unset.LightColor = "";
    }

    if (body.DarkColor) {
        $set.DarkColor = body.DarkColor;
    } else {
        $unset.DarkColor = "";
    }

    const update: { $set: Partial<AlbumSchema>; $unset?: Record<string, ""> } = { $set };
    if (Object.keys($unset).length) {
        update.$unset = $unset;
    }

    await Albums.updateOne({ _albumId: new ObjectId(body._albumId) }, update);

    const updated = await Albums.findOne({
        _albumId: new ObjectId(body._albumId)
    }) as AlbumSchema;

    return {
        message: "Album updated.",
        album: serializeAlbum(updated)
    };
};

export const updateTrack = async (request: Request) => {
    const body = request.body as Partial<TracksSchema> & {
        _albumId?: string;
        _trackId?: string;
    };

    if (!body._trackId || !ObjectId.isValid(body._trackId)) {
        throw new Error("Valid _trackId is required.");
    }

    if (!body._albumId || !ObjectId.isValid(body._albumId)) {
        throw new Error("Valid _albumId is required.");
    }

    if (!body.Title || !body.Artist || !body.url || !body.Duration) {
        throw new Error("Missing required track fields (_albumId, Title, Artist, url, Duration).");
    }

    const { Tracks } = MongoStudioHandler.getCollectionSet();

    const existing = await Tracks.findOne({
        _trackId: new ObjectId(body._trackId)
    });

    if (!existing) {
        throw new Error("Track not found.");
    }

    const $set: Partial<TracksSchema> = {
        _albumId: new ObjectId(body._albumId),
        Title: body.Title,
        Artist: body.Artist,
        url: body.url,
        Duration: body.Duration,
        streamCount: typeof body.streamCount === "number" ? body.streamCount : 0
    };

    const $unset: Record<string, ""> = {};

    if (body.lyrics) {
        $set.lyrics = true;
    } else {
        $unset.lyrics = "";
    }

    if (body.sync) {
        $set.sync = true;
    } else {
        $unset.sync = "";
    }

    const update: { $set: Partial<TracksSchema>; $unset?: Record<string, ""> } = { $set };
    if (Object.keys($unset).length) {
        update.$unset = $unset;
    }

    await Tracks.updateOne({ _trackId: new ObjectId(body._trackId) }, update);

    const updated = await Tracks.findOne({
        _trackId: new ObjectId(body._trackId)
    }) as TracksSchema;

    return {
        message: "Track updated.",
        track: serializeTrack(updated)
    };
};

const serializeUser = (user: UserSchema) => ({
    _id: String(user._id),
    username: user.username,
    email: user.email,
    googleAccount: user.googleAccount,
    accountAccess: {
        ...user.accountAccess,
        timeLimit: user.accountAccess.timeLimit
            ? moment(user.accountAccess.timeLimit).toISOString()
            : null
    },
    loggedIn: user.loggedIn,
    status: user.status,
    recentsLastModified: user.recentsLastModified
        ? moment(user.recentsLastModified).toISOString()
        : null,
    recentlyPlayed: (user.recentlyPlayed || []).map((each) => ({
        albumId: each.albumId,
        frequency: each.frequency,
        last: moment(each.last).toISOString()
    })),
    activeSessions: user.activeSessions || [],
    hasPassword: Boolean(user.password?.key),
    installedVersion: user.installedVersion
});

const parseRecentlyPlayed = (items: unknown) => {
    if (!Array.isArray(items)) {
        throw new Error("recentlyPlayed must be an array.");
    }

    return items.map((item, index) => {
        if (!item || typeof item !== "object") {
            throw new Error(`recentlyPlayed[${index}] must be an object.`);
        }

        const { albumId, frequency, last } = item as RecentlyPlayed;

        if (!albumId || typeof albumId !== "string") {
            throw new Error(`recentlyPlayed[${index}].albumId is required.`);
        }

        if (typeof frequency !== "number" || frequency < 0) {
            throw new Error(`recentlyPlayed[${index}].frequency must be a non-negative number.`);
        }

        const lastDate = moment(last);
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

const parseActiveSessions = (items: unknown) => {
    if (!Array.isArray(items)) {
        throw new Error("activeSessions must be an array.");
    }

    return items.map((item, index) => {
        if (!item || typeof item !== "object") {
            throw new Error(`activeSessions[${index}] must be an object.`);
        }

        const { seen, device, sessionId, lastUsed } = item as ActiveSession;

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

export const searchUsers = async (request: Request) => {
    const q = String(request.query.q ?? request.query.search ?? "").trim();

    if (!q) {
        return { users: [] };
    }

    const { Users } = MongoStudioHandler.getCollectionSet();
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");

    const users = await Users.find(
        {
            $or: [
                { username: regex },
                { "googleAccount.email": regex },
                { "googleAccount.name": regex },
                { "email.id": regex }
            ]
        },
        {
            projection: {
                username: 1,
                googleAccount: 1,
                email: 1,
                status: 1,
                accountAccess: 1
            }
        }
    )
        .sort({ "googleAccount.email": 1 })
        .limit(30)
        .toArray() as UserSchema[];

    return {
        users: users.map((user) => ({
            _id: String(user._id),
            username: user.username,
            email: user.googleAccount?.email || user.email?.id || "",
            name: user.googleAccount?.name || "",
            status: user.status,
            accessType: user.accountAccess?.type || ""
        }))
    };
};

export const getUserById = async (request: Request) => {
    const userId = String(request.query.userId ?? "").trim();

    if (!userId || !ObjectId.isValid(userId)) {
        throw new Error("Valid userId is required.");
    }

    const { Users } = MongoStudioHandler.getCollectionSet();

    const user = await Users.findOne({
        _id: new ObjectId(userId)
    }) as UserSchema | null;

    if (!user) {
        throw new Error("User not found.");
    }

    return { user: serializeUser(user) };
};

export const updateUser = async (request: Request) => {
    const body = request.body as {
        _id?: string;
        accountAccess?: {
            duration?: number;
        };
        recentlyPlayed?: unknown;
        activeSessions?: unknown;
    };

    if (!body._id || !ObjectId.isValid(body._id)) {
        throw new Error("Valid _id is required.");
    }

    if (typeof body.accountAccess?.duration !== "number" || body.accountAccess.duration < 0) {
        throw new Error("accountAccess.duration must be a non-negative number (seconds).");
    }

    const recentlyPlayed = parseRecentlyPlayed(body.recentlyPlayed);
    const activeSessions = parseActiveSessions(body.activeSessions);

    const { Users } = MongoStudioHandler.getCollectionSet();

    const existing = await Users.findOne({
        _id: new ObjectId(body._id)
    }) as UserSchema | null;

    if (!existing) {
        throw new Error("User not found.");
    }

    const durationChanged = body.accountAccess.duration !== existing.accountAccess.duration;
    const finalActiveSessions = durationChanged
        ? activeSessions.map((each) => ({ ...each, seen: false }))
        : activeSessions;

    await Users.updateOne(
        { _id: new ObjectId(body._id) },
        {
            $set: {
                accountAccess: {
                    ...existing.accountAccess,
                    duration: body.accountAccess.duration,
                    timeLimit: null
                },
                recentlyPlayed,
                activeSessions: finalActiveSessions,
                recentsLastModified: moment().tz(timezone).toDate()
            }
        }
    );

    const updated = await Users.findOne({
        _id: new ObjectId(body._id)
    }) as UserSchema;

    return {
        message: "User updated.",
        user: serializeUser(updated)
    };
};

export const addTrack = async () => {

    const { Albums, Tracks } = MongoStudioHandler.getCollectionSet();

    const ALBUMLIST = [SONGLIST2[SONGLIST2.length-1]];

    console.log(ALBUMLIST);

    for (let i=0; i<ALBUMLIST.length; i++) {

        console.log(i+1);

        const each = ALBUMLIST[i];

        if (each.Type === "Single") {

            const single = each as Single;

            const new_album: AlbumSchema = {
                _id: new ObjectId(),
                _albumId: new ObjectId(single._albumId),
                Album: single.Album,
                AlbumArtist: single.AlbumArtist,
                Year: single.Year,
                Color: single.Color,
                releaseDate: moment(single.releaseDate).format("YYYY-MM-DD"),
                Thumbnail: single.Thumbnail,
                Type: "Single",
                ...(() => {
                    const obj: { LightColor?: string; DarkColor?: string } = {};
                    if (single.LightColor) obj.LightColor = single.LightColor;
                    if (single.DarkColor) obj.DarkColor = single.DarkColor;
                    return obj;
                })()
            };

            const new_track: TracksSchema = {
                _id: new ObjectId(),
                _albumId: new ObjectId(single._albumId),
                _trackId: new ObjectId(single._trackId),
                Title: single.Album,
                Artist: single.Artist,
                url: single.url,
                Duration: single.Duration,
                ...(() => {
                    const obj: { lyrics?: boolean; sync?: boolean; } = {};
                    if (single.lyrics) obj.lyrics = single.lyrics;
                    if (single.sync) obj.sync = single.sync;
                    return obj;
                })(),
                streamCount: 0
            };

            await Albums.insertOne(new_album);
            await Tracks.insertOne(new_track);

        }
        else if (each.Type === "Album") {

            const album = each as Album;

            const new_album: AlbumSchema = {
                _id: new ObjectId(),
                _albumId: new ObjectId(album._albumId),
                Album: album.Album,
                AlbumArtist: album.AlbumArtist,
                Year: album.Year,
                Color: album.Color,
                releaseDate: moment(album.releaseDate).format("YYYY-MM-DD"),
                Thumbnail: album.Thumbnail,
                Type: "Album",
                ...(() => {
                    const obj: { LightColor?: string; DarkColor?: string } = {};
                    if (album.LightColor) obj.LightColor = album.LightColor;
                    if (album.DarkColor) obj.DarkColor = album.DarkColor;
                    return obj;
                })()
            };

            await Albums.insertOne(new_album);

            for (let t=0; t<album.Tracks.length; t++) {

                const track = album.Tracks[t];

                const new_track: TracksSchema = {
                    _id: new ObjectId(),
                    _albumId: new ObjectId(album._albumId),
                    _trackId: new ObjectId(track._trackId),
                    Title: track.Title,
                    Artist: track.Artist,
                    url: track.url,
                    Duration: track.Duration,
                    ...(() => {
                        const obj: { lyrics?: boolean; sync?: boolean; } = {};
                        if (track.lyrics) obj.lyrics = track.lyrics;
                        if (track.sync) obj.sync = track.sync;
                        return obj;
                    })(),
                    streamCount: 0
                };

                await Tracks.insertOne(new_track);

            }

        }

        console.log("-------------------");

    }

};
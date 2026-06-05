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
    ActiveSession
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
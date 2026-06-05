import { Request, Response } from "express";
import _ from "lodash";
import { ObjectId } from "mongodb";
import moment from "moment-timezone";
import path from "path";

import { NodemailerOptions } from "../helpers/interfaces";
import { sendEmail } from "../nodemailer-service";
import {
    AlbumList,
    Album,
    Single,
    RecentlyPlayed,
    ModifiedAlbumList,
    AlbumWithTrack,
    Lyrics,
    SpotifyLyrics,
    RequestQuery
} from "../helpers/interfaces";
import {
    timezone,
    server,
    standardCookieConfig,
    redirectUriCookieConfig,
    readFileAsync,
    randomize,
    __replace,
    convertToAlbumListFromDB,
    defaultResumeLinks
} from "../helpers/utils";
import { LATEST_APP_UPDATE } from "../data/latestUpdate";
import { MongoStudioHandler } from "../helpers/mongodb-connection";
import { AlbumSchema, ResumeConfigSchema, TracksSchema, UserSchema } from "../helpers/schema";



const compareRecents = (a: RecentlyPlayed, b: RecentlyPlayed) => {
    if (a.last < b.last) return 1;
    return -1;
};

const __distribute = (list: AlbumList[], type: string) => {

    let obj: { [key: number]: AlbumList[] } = {},
    times: number, songnum: number = 2, albumnum: number = 5,
    quicknum: number = 3, recentsnum: number = 3;

    if (type === "song") {
        let another = list.length > 8 ? list.slice(0,8) : list;
        times = Math.ceil(another.length / songnum);
        for (let i=0; i<times; i++) {
            obj[i] = another.slice(i*songnum,(i*songnum)+songnum);
        }
        return obj;
    }

    if (type === "album") {
        let another = list.length > 5 ? list.slice(0,5) : list;
        times = Math.ceil(another.length / albumnum);
        for (let i=0; i<times; i++) {
            obj[i] = another.slice(i*albumnum,(i*albumnum)+albumnum);
        }
        return obj;
    }

    if (type === "quick-pick") {
        times = Math.ceil(list.length / quicknum);
        for (let i=0; i<times; i++) {
            obj[i] = list.slice(i*quicknum,(i*quicknum)+quicknum);
        }
        return obj;
    }

    if (type === "recents") {
        times = Math.ceil(list.length / recentsnum);
        for (let i=0; i<times; i++) {
            obj[i] = list.slice(i*recentsnum,(i*recentsnum)+recentsnum);
        }
        return obj;
    }

    return { 1: list };

};

const inspectRecentlyPlayed = async (userId: string) => {

    const { Users } = MongoStudioHandler.getCollectionSet();

    if (!userId) return;
    const user = await Users.findOne({
        _id: new ObjectId(userId)
    }) as UserSchema | null;
    if (!user) return;

    const { recentlyPlayed } = user;
    let { recentsLastModified } = user;

    if (!recentsLastModified) {
        recentsLastModified = moment().subtract(1,"d").tz(timezone).startOf("d").toDate();
    }

    let shouldModify = false;
    const time = moment.duration(moment().tz(timezone).diff(moment(recentsLastModified)));
    const timeInDays = Math.floor(time.asDays());
    if (timeInDays > 0) shouldModify = true;

    const modifiedRecents = recentlyPlayed.reduce<RecentlyPlayed[]>((acc,each) => {

        let { frequency = 0, last = "" } = each;

        const diff = moment.duration(moment().tz(timezone).diff(moment(last)));
        const days = diff.asDays();
        if (days >= 7) return acc;

        if (frequency === 0) return acc;

        if (shouldModify && frequency - timeInDays > 0) {
            each.frequency = frequency - timeInDays;
        }

        if (each.frequency > 0) acc.push(each);

        return acc;

    }, []);


    Object.assign(user, {
        recentlyPlayed: modifiedRecents,
        recentsLastModified: shouldModify ?
            moment().tz(timezone).startOf("d").toDate() :
            recentsLastModified
    });

    await Users.updateOne(
        { _id: new ObjectId(user._id) },
        { $set: user }
    );

};

const getMostPlayed = async (userId: string): Promise<AlbumList[]> => {

    const { Users } = MongoStudioHandler.getCollectionSet();

    const user = await Users.findOne({
        _id: new ObjectId(userId)
    }) as UserSchema;

    let { recentlyPlayed: recents = [] } = user;

    recents = recents.sort(compareRecents);
    recents = recents.slice(0, 6);
    if (recents.length < 6) return [];

    const { Albums, Tracks } = MongoStudioHandler.getCollectionSet();

    const db_albums = await Albums.find({
        _albumId: {
            $in: _.map(recents, e => new ObjectId(e.albumId))
        }
    }).toArray() as AlbumSchema[];

    const db_tracks = await Tracks.find({
        _albumId: {
            $in: _.map(recents, e => new ObjectId(e.albumId))
        }
    }).toArray() as TracksSchema[];

    return recents.reduce<AlbumList[]>((albums, each) => {
        const album = db_albums.find(a => String(a._albumId) === String(each.albumId));
        if (!album) return albums;
        const tracks = db_tracks.filter(t => String(t._albumId) === String(each.albumId));
        albums.push(...convertToAlbumListFromDB([album], tracks));
        return albums;
    }, []);

};

const getQuickPicks = async (): Promise<AlbumList[]> => {

    const { Albums, Tracks } = MongoStudioHandler.getCollectionSet();

    const tracks = await Tracks.aggregate([
        {
            $sample: { size: 12 }
        }
    ])
    .toArray() as TracksSchema[];

    const albums = await Albums.find({
        _albumId: { $in: _.map(tracks, e => new ObjectId(e._albumId)) }
    }).toArray() as AlbumSchema[];

    const albumList = convertToAlbumListFromDB(albums, tracks);

    return albumList.reduce<AlbumList[]>((list, album) => {

        if ((album as Single).Type === "Single") list.push(album);

        if (album.Type === "Album") {
            const dummy_album: Album = album as Album;
            dummy_album.Tracks.forEach(track => {
                const song: any = { ...dummy_album, ...track };
                delete song.Tracks;
                list.push(song);
            });
        }

        return list;

    }, []);

};

const getNewReleases = async (): Promise<AlbumList[]> => {

    const { Albums, Tracks } = MongoStudioHandler.getCollectionSet();

    const albums = await Albums
        .find({})
        .sort({ releaseDate: -1 })
        .limit(6)
        .toArray() as AlbumSchema[];

    const tracks = await Tracks.find({
        _albumId: { $in: _.map(albums, e => new ObjectId(e._albumId)) }
    }).toArray() as TracksSchema[];

    return convertToAlbumListFromDB(albums, tracks);

};

const getRecentlyAdded = async (newReleases: AlbumList[]): Promise<AlbumList[]> => {

    const { Albums, Tracks } = MongoStudioHandler.getCollectionSet();

    const albums = await Albums
        .find({
            _albumId: { $nin: _.map(newReleases, e => new ObjectId(e._albumId)) }
        })
        .sort({ _id: -1 })
        .limit(6)
        .toArray() as AlbumSchema[];

    const tracks = await Tracks.find({
        _albumId: { $in: _.map(albums, e => new ObjectId(e._albumId)) }
    }).toArray() as TracksSchema[];

    return convertToAlbumListFromDB(albums, tracks);

};

const fetchSearchAlbumList = async (name: string): Promise<AlbumList[]> => {

    const regex = new RegExp(_.escapeRegExp(name), "i");

    const { Albums, Tracks } = MongoStudioHandler.getCollectionSet();

    const [trackMatches, albumMatches] = await Promise.all([
        Tracks.find({
            $or: [
                { Title: regex },
                { Artist: regex }
            ]
        }).toArray() as Promise<TracksSchema[]>,
        Albums.find({
            $or: [
                { Album: regex },
                { AlbumArtist: regex }
            ]
        }).toArray() as Promise<AlbumSchema[]>
    ]);

    const allAlbumIds = _.uniqBy([
        ..._.map(trackMatches, t => new ObjectId(t._albumId)),
        ..._.map(albumMatches, a => new ObjectId(a._albumId))
    ], id => String(id));

    if (allAlbumIds.length === 0) return [];

    const [albums, tracks] = await Promise.all([
        Albums.find({
            _albumId: { $in: allAlbumIds }
        }).toArray() as Promise<AlbumSchema[]>,
        Tracks.find({
            _albumId: { $in: allAlbumIds }
        }).toArray() as Promise<TracksSchema[]>
    ]);

    return convertToAlbumListFromDB(albums, tracks);

};

const filterSearchSongs = (albumList: AlbumList[], name: string): (AlbumWithTrack|Single)[] => {

    const lower = name.toLowerCase();

    return albumList.reduce<(AlbumWithTrack|Single)[]>((acc, song) => {

        const album = song as Album;
        const single = song as Single;

        if (song.Type === "Album") {

            for (let track of album.Tracks) {

                const inTitle = track.Title.toLowerCase().includes(lower);

                if (inTitle) {
                    const obj: AlbumWithTrack = { ...track, ...album };
                    obj.Tracks = [];
                    acc.push(obj);
                    continue;
                }

                const inArtist = track.Artist.toLowerCase().includes(lower);

                if (inArtist) {
                    const obj = { ...track, ...album };
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

const filterSearchAlbums = (albumList: AlbumList[], name: string): AlbumList[] => {

    const lower = name.toLowerCase();

    return albumList.reduce<AlbumList[]>((acc,song) => {

        const album = song as Album;
        const single = song as Single;

        if (song.Type === "Album") {

            let isInAlbum = false, isInTracks = false, isInAlbumArtist = false;

            for (let track of album.Tracks) {

                const inTitle = track.Title.toLowerCase().includes(lower);

                if (inTitle) {
                    isInTracks = true;
                    break;
                }

            }

            if (song.Album.toLowerCase().includes(lower)) isInAlbum = true;

            if (song.AlbumArtist.toLowerCase().includes(lower)) isInAlbumArtist = true;

            if (isInAlbum || isInTracks || isInAlbumArtist) acc.push(album);

            return acc;

        }
        
        if (song.Type === "Single") {

            const inAlbum = single.Album.toLowerCase().includes(lower);
            const inAlbumArtist = single.AlbumArtist.toLowerCase().includes(lower);

            if (inAlbum || inAlbumArtist) acc.push(single);

            return acc;

        }

        return acc;

    }, []);

};

const __qr = async (toBeExcluded: string): Promise<(AlbumWithTrack|Single)[]> => {

    const { Albums, Tracks } = MongoStudioHandler.getCollectionSet();

    const tracks = await Tracks.aggregate([
        {
            $match: {
                $expr: {
                    $and: [
                        { $ne: ["$_albumId", new ObjectId(toBeExcluded)] },
                        { $ne: ["$_trackId", new ObjectId(toBeExcluded)] }
                    ]
                }
            }
        },
        {
            $sample: { size: 80 }
        }
    ]).toArray() as TracksSchema[];

    const albums = await Albums.find({
        _albumId: { $in: _.map(tracks, e => new ObjectId(e._albumId)) }
    }).toArray() as AlbumSchema[];

    const albumList = convertToAlbumListFromDB(albums, tracks);

    return albumList.reduce<(AlbumWithTrack|Single)[]>((list, song) => {

        const album = song as Album;
        const single = song as Single;

        if (single.Type === "Single") list.push(single);
        
        if (album.Type === "Album") {
            album.Tracks.forEach(track => {
                const obj = { ...album, ...track };
                obj.Tracks = [];
                list.push(obj);
            });
        }

        return list;

    }, []);

};

const __rp = async (toBeExcluded: string, userId: string): Promise<(AlbumWithTrack|Single)[]> => {

    const { Users, Albums, Tracks } = MongoStudioHandler.getCollectionSet();

    const user = await Users.findOne({
        _id: new ObjectId(userId)
    }) as UserSchema | null;

    if (_.isEmpty(user)) return [];

    const { recentlyPlayed = [] } = user;

    const recentlyPlayedAlbumIds: string[] = _.map(recentlyPlayed, each => String(each.albumId));

    const albumsFromDb = await Albums.find({
        _albumId: { $in: _.map(recentlyPlayedAlbumIds, e => new ObjectId(e)) }
    }).toArray() as AlbumSchema[];

    const tracksFromDb = await Tracks.find({
        _albumId: { $in: _.map(albumsFromDb, e => new ObjectId(e._albumId)) }
    }).toArray() as TracksSchema[];

    const albumList = convertToAlbumListFromDB(albumsFromDb, tracksFromDb);

    const albums = albumList.reduce<(AlbumWithTrack|Single)[]>((list, song) => {

        const album = song as Album;
        const single = song as Single;

        if (String(album._albumId) === toBeExcluded) return list;

        if (single.Type === "Single") list.push(single);
        
        if (album.Type === "Album") {
            album.Tracks.forEach(t => {
                if (String(t._trackId) === toBeExcluded) return;
                const obj = { ...album, ...t };
                obj.Tracks = [];
                list.push(obj);
            });
        }

        return list;

    }, []);

    const len: number = albums.length;

    const final: (AlbumWithTrack|Single)[] = [];
    const randomNumberCounter: { [key: number]: boolean } = {};
    let done: boolean;

    for (let i=0; i<40; i++) {
        done = false;
        let limit = 3;
        while(!done) {
            if (limit === 0) break;
            else limit--;
            const rand = Math.floor(Math.random() * len);
            if (!randomNumberCounter[rand]) {
                final.push(albums[rand]);
                randomNumberCounter[rand] = true;
                done = true;
            }
        }
    };

    return final;

};

const __notifyOfAccessingLinks = async () => {

    try {

        const options: NodemailerOptions = {
            to: "toriumcar@gmail.com",
            subject: "Drive Link Accessed",
            html: "Someone accessed your drive link!"
        };

        await sendEmail(options);

    }
    catch(e: any) {
        console.log("error sending email to admin on drive access", e);
    }

};

const __notifyOfAccessingCustomResumeLinks = async (
    name: string,
    linkType: string
) => {

    try {

        const options: NodemailerOptions = {
            to: "toriumcar@gmail.com",
            subject: `${name} - ${linkType} accessed!`,
            html: "Someone accessed your custom link!"
        };

        await sendEmail(options);

    }
    catch(e: any) {
        console.log("error sending email to admin on custom link access", e);
    }

};



export const getAlbum = async (request: Request) => {

    const { albumId }: RequestQuery = request.query as unknown as RequestQuery;

    if (!albumId) return null;

    const { Albums, Tracks } = MongoStudioHandler.getCollectionSet();

    const album = await Albums.findOne({
        _albumId: new ObjectId(albumId)
    }) as any;

    const tracks = await Tracks.find({
        _albumId: new ObjectId(albumId)
    })
    .toArray() as TracksSchema[];

    if (album.Type === "Album") {
        album.Tracks = tracks;
        return album;
    }
    else {
        return {
            ...album,
            ...(tracks?.[0] || {})
        };
    }

};

export const getTrack = async (request: Request) => {

    const { Albums, Tracks } = MongoStudioHandler.getCollectionSet();

    const { trackId }: RequestQuery = request.query as unknown as RequestQuery;

    if (_.isEmpty(trackId)) return null;

    const track = await Tracks.findOne({
        _trackId: new ObjectId(trackId)
    }) as TracksSchema | null;

    if (_.isEmpty(track)) return null;

    const album = await Albums.findOne({
        _albumId: new ObjectId(track._albumId)
    }) as AlbumSchema | null;

    if (_.isEmpty(album)) return null;

    const finalTrack: any = {
        ...(() => {
            delete (track as any)._id;
            return track;
        })(),
        ...(() => {
            delete (album as any)._id;
            return album;
        })(),
    };

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

export const homeAlbums = async (request: Request, _:any) => {

    const { id: userId } = request.ACCOUNT;

    const mostPlayed = await getMostPlayed(userId);

    const homeList: { [key: string]: AlbumList[] } = {};

    homeList["New Releases"] = await getNewReleases();

    homeList["Recently Added"] = await getRecentlyAdded(homeList["New Releases"]);

    return { albums: homeList, mostPlayed, quickPicks: await getQuickPicks() };

};

export const getLibrary = async (request: Request, response: Response) => {

    const { page }: RequestQuery = request.query as unknown as { page: string; };

    const start = parseInt(page || "1") - 1;
    const no = 7 * 7;

    const { Albums, Tracks } = MongoStudioHandler.getCollectionSet();

    const albums = await Albums.find().sort({_id:1}).toArray() as AlbumSchema[];

    const tracks = await Tracks.find().sort({_id:1}).toArray() as TracksSchema[];

    const albumList = convertToAlbumListFromDB(albums, tracks);

    const arr = _.map(albumList, (e,i): ModifiedAlbumList => {
        (e as ModifiedAlbumList).keyId = i;
        return e as ModifiedAlbumList;
    });

    const sublibrary = arr.slice(start*no, (start*no) + no);
    const random: ModifiedAlbumList[] = (randomize(sublibrary) as ModifiedAlbumList[]);

    let result: { more: boolean, data: ModifiedAlbumList[] };

    if ((start*no)+no === arr.length || sublibrary.length < no) {
        result = { more: false, data: random };
    } else {
        result = { more: true, data: random };
    }

    return result;

};

export const getTrackDetails = async (request: Request, _:any) => {
    return { track: await getTrack(request) };
};

export const getAlbumDetails = async (request: Request, _:any) => {
    return { album: await getAlbum(request) };
};

export const search = async (request: Request, _:any) => {

    const { name }: RequestQuery = request.query as unknown as RequestQuery;

    if (!name) return { songs: [], albums: [], artists: [] };

    const albumList = await fetchSearchAlbumList(name);

    return {
        songs: filterSearchSongs(albumList, name),
        albums: filterSearchAlbums(albumList, name),
        artists: []
    };

};

export const addToRecentlyPlayed = async (request: Request) => {

    const { Users } = MongoStudioHandler.getCollectionSet();

    const { id: userId } = request.ACCOUNT;
    const { albumId, trackId }: { albumId: string; trackId: string; } = request.body;

    const user = await Users.findOne({
        _id: new ObjectId(userId)
    }) as UserSchema | null;

    if (!user) return;

    const { recentlyPlayed: recents } = user;

    const index = recents.findIndex(each => each.albumId === albumId);
    if (index === -1) {
        recents.push({ albumId, frequency: 1, last: moment().tz(timezone).toDate() });
    }
    else {
        recents[index].frequency++;
        recents[index].last = moment().tz(timezone).toDate();
    }

    Object.assign(user, { recentlyPlayed: recents });

    await Users.updateOne(
        { _id: new ObjectId(user._id) },
        { $set: user }
    );

    const { Tracks } = MongoStudioHandler.getCollectionSet();

    await Tracks.updateOne(
        {
            _trackId: _.isEmpty(trackId) ?
                (_.isEmpty(albumId) ? null : new ObjectId(albumId)) :
                new ObjectId(trackId)
        },
        { $inc: { streamCount: 1 } }
    );

    return;

};

export const removeFromRecentlyPlayed = async (request: Request, _:any) => {

    const { Users } = MongoStudioHandler.getCollectionSet();

    const { id: userId } = request.ACCOUNT;
    const { albumId }: { albumId: string } = request.body;

    const user = await Users.findOne({
        _id: new ObjectId(userId)
    }) as UserSchema | null;

    if (!user) return;

    const { recentlyPlayed: recents } = user;

    const index = recents.findIndex(each => each.albumId === albumId);

    if (index > -1) {
        recents.splice(index, 1);
        Object.assign(user, { recentlyPlayed: recents });
        await Users.updateOne(
            { _id: new ObjectId(user._id) },
            { $set: user }
        );
    }

    return;

};

export const getLyrics = async (request: Request, _:any) => {

    let { name }: RequestQuery = request.query as unknown as RequestQuery;
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

        const list = data.map<SpotifyLyrics>((each: SpotifyLyrics, i: number) => {
            each.key = i;
            return each;
        });

        return list;

    }
    catch(e) {
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

export const startRadio = async (request: Request, _:any) => {

    const { exclude: toBeExcluded = "", type }: RequestQuery = request.query as unknown as RequestQuery;
    const { id: userId } = request.ACCOUNT;

    let finalArr: (AlbumWithTrack|Single)[] = [];

    if (type === "qr") {
        finalArr = await __qr(toBeExcluded);
    }
    else if (type === "rp") {
        finalArr = await __rp(toBeExcluded, userId);
    }

    return finalArr;
    
};

export const recordTime = async (request: Request, _:any) => {

    const { id: userId } = request.ACCOUNT;

    // const user: UserInterface = await Users.findOne({ _id: userId });

    // Object.assign(user,{
    //     lastUsed: getCurrentTime()
    // });

    // await user.save();

    return;

};

export const activateCheck = async (request: Request, _:any) => {

    const { id: userId } = request.ACCOUNT;

    inspectRecentlyPlayed(userId);
    
    return { status: "active", server };

};

export const getProfile = async (request: Request, _res:any) => {

    const { Users } = MongoStudioHandler.getCollectionSet();

    const { id: userId } = request.ACCOUNT;
    const { from = "" } = request.query;

    const user = await Users.findOne({
        _id: new ObjectId(userId)
    }) as UserSchema | null;

    if (!user) return {};

    const { googleAccount, accountAccess } = user;

    if (from !== "auth") {
        return {
            name: user.username,
            email: googleAccount.email,
            picture: googleAccount.picture,
            limit: moment(accountAccess.timeLimit).tz(timezone).format("DD MMMM YYYY hh:mm A")
        };
    }

    const { recentlyPlayed = [] } = user;
    const recents = recentlyPlayed.sort(compareRecents).slice(0, 6);

    const { Albums, Tracks } = MongoStudioHandler.getCollectionSet();

    const db_albums = await Albums.find({
        _albumId: {
            $in: _.map(recents, e => new ObjectId(e.albumId))
        }
    }).toArray() as AlbumSchema[];

    const db_tracks = await Tracks.find({
        _albumId: {
            $in: _.map(recents, e => new ObjectId(e.albumId))
        }
    }).toArray() as TracksSchema[];

    const list: AlbumList[] = recents.reduce<AlbumList[]>((acc, each) => {
        const album = db_albums.find(a => String(a._albumId) === String(each.albumId));
        if (!album) return acc;
        const tracks = db_tracks.filter(t => String(t._albumId) === String(each.albumId));
        acc.push(...convertToAlbumListFromDB([album], tracks));
        return acc;
    }, []);

    const dist = __distribute(list, "recents");
    
    const res = JSON.parse(JSON.stringify(user));
    res.recentlyPlayed = dist;

    return { found: true, user: res };

};

export const signOut = async (request: Request, response: Response) => {

    const { Users } = MongoStudioHandler.getCollectionSet();

    const { ACCOUNT, result } = request;
    const { sessionId = null } = result;

    const user = await Users.findOne({
        _id: new ObjectId(ACCOUNT.id)
    }) as UserSchema | null;

    if (!user) return { success: false };

    const { activeSessions = [] } = user;

    Object.assign(user, {
        activeSessions: activeSessions.filter(each => {
            return each.sessionId !== sessionId;
        })
    });

    await Users.updateOne(
        { _id: new ObjectId(user._id) },
        { $set: user }
    );

    response.clearCookie("ACCOUNT", standardCookieConfig);
    response.clearCookie("ACCOUNT_REFRESH", standardCookieConfig);
    response.clearCookie("REDIRECT_URI", redirectUriCookieConfig);

    return { success: true };

};

export const getLatestUpdate = async (request: Request, _:any) => {

    const latest = LATEST_APP_UPDATE.RELEASE;

    return {
        versionCode: latest.versionCode,
        versionName: latest.versionName
    };

};

export const getOriginalResumeLink = async (req: Request, res: Response) => {

    try {

        const {
            id = null,
            linkType = null
        } = (req?.params || {}) as { id: string, linkType: string };

        if (
            _.isEmpty(id) ||
            !Object.keys(defaultResumeLinks).includes(linkType || "")
        ) {
            throw new Error("invalid url!");
        }

        const { ResumeConfigs } = MongoStudioHandler.getCollectionSet();

        const config = await ResumeConfigs.findOne({
            _id: new ObjectId(id as string)
        }) as ResumeConfigSchema | null;

        if (_.isEmpty(config)) {
            throw new Error("no config found, invalid id!");
        }

        const u = await ResumeConfigs.updateOne(
            { _id: new ObjectId(config._id) },
            {
                $push: {
                    entries: {
                        $each: [{
                            linkType,
                            date: moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
                        }]
                    }
                }
            } as any
        );

        const orig_link = defaultResumeLinks[linkType as string];

        __notifyOfAccessingCustomResumeLinks(config.name, linkType as string);

        res.redirect(orig_link);

    }
    catch(e: any) {
        console.log("error in resume link", e);
        res.status(404).end();
    } 

};

export const demoVideosLink = async (_: Request, res: Response) => {

    const drive_url = process.env.DRIVE_LINK || null;

    if (drive_url === null) return res.status(404).end();

    __notifyOfAccessingLinks();

    return res.redirect(drive_url);

};

export const sendEmailApi = async (req: Request, res: Response) => {

    const {
        to = "",
        subject = "",
        message = ""
    } = req.body as { to: string, subject: string, message: string };

    const options: NodemailerOptions = {
        to,
        subject,
        html: message
    };

    return await sendEmail(options);

};
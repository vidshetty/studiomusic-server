import { ObjectId } from "mongodb";
import {
    GoogleProfileInfo,
    RecentlyPlayed,
    ActiveSession,
    InstalledVersion
} from "./interfaces";



export interface AlbumSchema {
    _id: ObjectId;
    _albumId: ObjectId;
    Album: string;
    AlbumArtist: String;
    Year: string;
    Color: string;
    LightColor?: string;
    DarkColor?: string;
    releaseDate: string;
    Thumbnail: string;
    Type: "Album" | "Single";
};

export interface TracksSchema {
    _id: ObjectId;
    _albumId: ObjectId;
    _trackId: ObjectId;
    Title: string;
    Artist: string;
    url: string;
    Duration: string;
    lyrics?: boolean;
    sync?: boolean;
    streamCount: number;
};

export interface UserSchema {
    _id: ObjectId;
    username: string | null;
    email: {
        id: string;
        verificationStatus: string;
        uuid?: string;
        uuidExpiry?: Date;
    };
    password: {
        key: string;
        uuid?: string;
        uuidExpiry?: Date;
    };
    googleAccount: GoogleProfileInfo;
    accountAccess: {
        duration: number;
        timeLimit: Date | null;
        type: string;
        uid?: string;
    };
    loggedIn: string;
    recentsLastModified: Date | null;
    recentlyPlayed: RecentlyPlayed[];
    status: string;
    activeSessions: ActiveSession[];
    installedVersion: InstalledVersion | null;
};

export interface ResumeConfigSchema {
    _id: ObjectId;
    name: string;
    entries: {
        linkType: string;
        date: string;
    }[];
};
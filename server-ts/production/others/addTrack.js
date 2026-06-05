"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const path_1 = __importDefault(require("path"));
const mongodb_connection_1 = require("../helpers/mongodb-connection");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: path_1.default.join(process.cwd(), "ENV", ".env") });
(async () => {
    await mongodb_connection_1.MongoStudioHandler.initialize();
    const { Albums, Tracks } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const tracks = [
        {
            _trackId: "694eb4d356b30ee982c6d32f",
            Title: "Ez-Ez",
            Artist: "Shashwat Sachdev, Diljit Dosanjh, Hanumankind, Various Artists",
            url: `https://player.studiomusic.app/hls/listen/Ez-Ez - Dhurandhar/output.m3u8`,
            Duration: "3: 02"
        },
        {
            _trackId: "694eb4dba0dd27264214afa6",
            Title: "Move - Yeh Ishq Ishq",
            Artist: "Shashwat Sachdev, Sonu Nigam, Various Artists",
            url: `https://player.studiomusic.app/hls/listen/Move - Yeh Ishq Ishq - Dhurandhar/output.m3u8`,
            Duration: "3: 24"
        },
        {
            _trackId: "694eb4e2ff48fff29fbc27c0",
            Title: "Naal Nachna",
            Artist: "Shashwat Sachdev, Various Artists",
            url: `https://player.studiomusic.app/hls/listen/Naal Nachna - Dhurandhar/output.m3u8`,
            Duration: "2: 25"
        }
    ];
    for (let t = 0; t < tracks.length; t++) {
        const track = tracks[t];
        const new_track = Object.assign(Object.assign({ _id: new mongodb_1.ObjectId(), _albumId: new mongodb_1.ObjectId("693fceaad147e0b429729931"), _trackId: new mongodb_1.ObjectId(track._trackId), Title: track.Title, Artist: track.Artist, url: track.url, Duration: track.Duration }, (() => {
            const obj = {};
            if (track.lyrics)
                obj.lyrics = track.lyrics;
            if (track.sync)
                obj.sync = track.sync;
            return obj;
        })()), { streamCount: 0 });
        await Tracks.insertOne(new_track);
    }
    console.log("-------------------");
    process.exit();
})();
//# sourceMappingURL=addTrack.js.map
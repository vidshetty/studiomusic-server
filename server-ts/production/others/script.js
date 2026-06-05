"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const mongodb_connection_1 = require("../helpers/mongodb-connection");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: path_1.default.join(process.cwd(), "ENV", ".env") });
(async () => {
    await mongodb_connection_1.MongoStudioHandler.initialize();
    const { Albums, Tracks } = mongodb_connection_1.MongoStudioHandler.getCollectionSet();
    const tracks = await Tracks.find({}).toArray();
    console.log("tracks", tracks.length);
    for (let i = 0; i < tracks.length; i++) {
        console.log("i", i);
        const { url = "" } = tracks[i];
        const split = url.split("/");
        if (split.includes("hls")) {
            continue;
        }
        console.log(split);
        split.splice(3, 0, "hls");
        split.push("output.m3u8");
        const join = split.join("/");
        console.log(join);
        const u = await Tracks.updateOne({ _id: tracks[i]._id }, {
            $set: {
                url: join,
                updatedToHls: true
            }
        });
        console.log(u);
    }
    process.exit();
})();
//# sourceMappingURL=script.js.map
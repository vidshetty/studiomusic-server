"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoStudioHandler = void 0;
const mongodb_1 = require("mongodb");
const Collection = Object.freeze({
    ALBUMS: "albums",
    TRACKS: "tracks",
    USERS: "users",
    RESUME_CONFIGS: "resumeConfigs"
});
class MongoStudioHandler {
    // initialise
    static async initialize() {
        const MONGO_URI = process.env.MONGO_URI;
        if (MONGO_URI === null)
            throw new Error("invalid environment");
        if (this.__db !== null)
            return;
        const Database = await mongodb_1.MongoClient.connect(MONGO_URI, {
            readPreference: "primary"
        });
        this.__db = Database.db("studio");
        console.log("connected to STUDIO database on environment" +
            " with preference " + this.__db.readPreference.preference);
        this.__Albums = this.__db.collection(Collection.ALBUMS);
        this.__Tracks = this.__db.collection(Collection.TRACKS);
        this.__Users = this.__db.collection(Collection.USERS);
        this.__ResumeConfigs = this.__db.collection(Collection.RESUME_CONFIGS);
    }
    ;
    static getCollectionSet() {
        return Object.freeze({
            Albums: this.__Albums,
            Tracks: this.__Tracks,
            Users: this.__Users,
            ResumeConfigs: this.__ResumeConfigs
        });
    }
}
exports.MongoStudioHandler = MongoStudioHandler;
// DB connection
MongoStudioHandler.__db = null;
;
//# sourceMappingURL=mongodb-connection.js.map
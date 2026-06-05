import mongodb, { MongoClient } from "mongodb";



const Collection = Object.freeze({
    ALBUMS: "albums",
    TRACKS: "tracks",
    USERS: "users",
    RESUME_CONFIGS: "resumeConfigs"
});



export class MongoStudioHandler {

    // DB connection
    private static __db: mongodb.Db | null = null;

    // all granary collections
    private static __Albums: mongodb.Collection;
    private static __Tracks: mongodb.Collection;
    private static __Users: mongodb.Collection;
    private static __ResumeConfigs: mongodb.Collection;

    // initialise
    static async initialize() {

        const MONGO_URI = process.env.MONGO_URI as string;

        if (MONGO_URI === null) throw new Error("invalid environment");

        if (this.__db !== null) return;

        const Database: mongodb.MongoClient = await MongoClient.connect(MONGO_URI, {
            readPreference: "primary"
        });

        this.__db = Database.db("studio");

        console.log(
            "connected to STUDIO database on environment" +
            " with preference " + this.__db.readPreference.preference
        );

        this.__Albums = this.__db.collection(Collection.ALBUMS);
        this.__Tracks = this.__db.collection(Collection.TRACKS);
        this.__Users = this.__db.collection(Collection.USERS);
        this.__ResumeConfigs = this.__db.collection(Collection.RESUME_CONFIGS);

    };

    static getCollectionSet() {
        return Object.freeze({
            Albums: this.__Albums,
            Tracks: this.__Tracks,
            Users: this.__Users,
            ResumeConfigs: this.__ResumeConfigs
        });
    }

};
import { Request, Response, Router } from "express";
import fs from "fs";
import path from "path";
import { buildroot } from "./utils";

const router = Router();



const exists = (folder: string, file: string): boolean => {
    return fs.existsSync(path.join(process.cwd(), buildroot, folder, "static", file));
};

const getpath = (folder: string, file: string): string => {
    return path.join(process.cwd(), buildroot, folder, "static", file);
};



router.get("/*", (request: Request, response: Response, _:any) => {

    let returnpath: string | null = null;

    if (exists("player-build", request.path)) returnpath = getpath("player-build", request.path);

    if (exists("build", request.path)) returnpath = getpath("build", request.path);

    if (exists("mobile-build", request.path)) returnpath = getpath("mobile-build", request.path);

    if (!returnpath) return response.status(404).end();
    return response.sendFile(returnpath);

});



export default router;
import { Request, Response, Router } from "express";
import path from "path";
import { buildroot } from "./utils";

const router = Router();



router.get("/*", (request: Request, response: Response, _:any) => {

    return response.sendFile(
        path.join(process.cwd(), buildroot, "player-build", "static", request.path)
    );

});



export default router;
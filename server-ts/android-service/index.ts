import { Router, Response } from "express";
import authservice from "./auth-index";
import apiservice from "./api-index";
import { androidErrorHandler } from "../helpers/middlewares";


const router = Router();


router.use("/auth", authservice);

router.use("/api", apiservice);

router.use("*", (_:any, response: Response) => {
    return response.status(404).end();
});

router.use(androidErrorHandler);



export default router;
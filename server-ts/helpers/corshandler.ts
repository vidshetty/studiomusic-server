import { Request, Response, NextFunction } from "express";


const corshandler = (_: Request, response: Response, next: NextFunction) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Headers", "*");
    return next();
};


export default corshandler;
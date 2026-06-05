import { Request, Response } from "express";


export const responseMid = (routeFunc: Function) => async (req: Request, res: Response) => {

    try {
        const data = await routeFunc(req,res);
        return res.status(200).send(data);
    }
    catch(e) {
        if (e instanceof Error) {
            return res.status(500).send({
                message: e.message,
                stack: e.stack
            });
        }
        return res.status(500).end();
    }

};
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseMid = void 0;
const responseMid = (routeFunc) => async (req, res) => {
    try {
        const data = await routeFunc(req, res);
        return res.status(200).send(data);
    }
    catch (e) {
        if (e instanceof Error) {
            return res.status(500).send({
                message: e.message,
                stack: e.stack
            });
        }
        return res.status(500).end();
    }
};
exports.responseMid = responseMid;
//# sourceMappingURL=responsehandler.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const corshandler = (_, response, next) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Headers", "*");
    return next();
};
exports.default = corshandler;
//# sourceMappingURL=corshandler.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
const router = (0, express_1.Router)();
const exists = (folder, file) => {
    return fs_1.default.existsSync(path_1.default.join(process.cwd(), utils_1.buildroot, folder, "static", file));
};
const getpath = (folder, file) => {
    return path_1.default.join(process.cwd(), utils_1.buildroot, folder, "static", file);
};
router.get("/*", (request, response, _) => {
    let returnpath = null;
    if (exists("player-build", request.path))
        returnpath = getpath("player-build", request.path);
    if (exists("build", request.path))
        returnpath = getpath("build", request.path);
    if (exists("mobile-build", request.path))
        returnpath = getpath("mobile-build", request.path);
    if (!returnpath)
        return response.status(404).end();
    return response.sendFile(returnpath);
});
exports.default = router;
//# sourceMappingURL=staticrouter.js.map
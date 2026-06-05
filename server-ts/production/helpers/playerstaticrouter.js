"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
const router = (0, express_1.Router)();
router.get("/*", (request, response, _) => {
    return response.sendFile(path_1.default.join(process.cwd(), utils_1.buildroot, "player-build", "static", request.path));
});
exports.default = router;
//# sourceMappingURL=playerstaticrouter.js.map
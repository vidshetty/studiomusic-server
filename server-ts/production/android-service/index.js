"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_index_1 = __importDefault(require("./auth-index"));
const api_index_1 = __importDefault(require("./api-index"));
const middlewares_1 = require("../helpers/middlewares");
const router = (0, express_1.Router)();
router.use("/auth", auth_index_1.default);
router.use("/api", api_index_1.default);
router.use("*", (_, response) => {
    return response.status(404).end();
});
router.use(middlewares_1.androidErrorHandler);
exports.default = router;
//# sourceMappingURL=index.js.map
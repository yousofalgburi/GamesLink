"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
const ws_1 = require("ws");
const express_1 = __importDefault(require("express"));
const config_1 = require("./config");
const utils_1 = require("./utils");
const app = (0, express_1.default)();
const wss = new ws_1.WebSocketServer({ noServer: true });
const startServer = () => {
    const server = app.listen(config_1.port, () => {
        console.log(`Server is running on port ${config_1.port}`);
    });
    server.on('upgrade', (0, utils_1.handleUpgrade)(wss));
    return wss;
};
exports.startServer = startServer;

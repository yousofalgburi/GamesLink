"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webSocketServer_1 = require("./webSocketServer");
const utils_1 = require("./utils");
const wss = (0, webSocketServer_1.startServer)();
wss.on('connection', (ws) => {
    ws.on('error', utils_1.onSocketError);
    ws.on('message', (0, utils_1.onSocketMessage)(ws));
    ws.on('close', (0, utils_1.onSocketClose)(ws));
});

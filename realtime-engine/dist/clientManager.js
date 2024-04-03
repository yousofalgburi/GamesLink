"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = exports.removeClient = exports.addClient = void 0;
const connectedClients = new Map();
const addClient = (ws, userId, roomId) => {
    connectedClients.set(ws, { userId, roomId });
};
exports.addClient = addClient;
const removeClient = (ws) => {
    const user = connectedClients.get(ws);
    connectedClients.delete(ws);
    return user === null || user === void 0 ? void 0 : user.userId;
};
exports.removeClient = removeClient;
const getClient = (ws) => {
    return connectedClients.get(ws);
};
exports.getClient = getClient;

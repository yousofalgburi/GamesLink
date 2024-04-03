"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomSize = exports.notifyClients = exports.leaveRoom = exports.joinRoomQueue = exports.joinRoom = void 0;
const ws_1 = require("ws");
const rooms = {};
const joinRoom = (roomId, ws, userId) => {
    if (!rooms[roomId]) {
        rooms[roomId] = new Set();
    }
    if (!rooms[roomId].has(ws)) {
        rooms[roomId].add(ws);
        (0, exports.notifyClients)(roomId, 'userJoined', { roomId, userId: userId });
    }
};
exports.joinRoom = joinRoom;
const joinRoomQueue = (roomId, ws, userId) => {
    if (!rooms[roomId]) {
        return;
    }
    if (!rooms[roomId].has(ws)) {
        (0, exports.notifyClients)(roomId, 'userJoinedQueue', { roomId, userId: userId });
    }
};
exports.joinRoomQueue = joinRoomQueue;
const leaveRoom = (roomId, ws, userId) => {
    if (rooms[roomId]) {
        rooms[roomId].delete(ws);
        (0, exports.notifyClients)(roomId, 'userLeft', { userId: userId });
    }
};
exports.leaveRoom = leaveRoom;
const notifyClients = (roomId, type, data) => {
    if (rooms[roomId]) {
        rooms[roomId].forEach((client) => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(JSON.stringify(Object.assign({ type }, data)));
            }
        });
    }
};
exports.notifyClients = notifyClients;
const getRoomSize = (roomId) => {
    return rooms[roomId] ? rooms[roomId].size : 0;
};
exports.getRoomSize = getRoomSize;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onSocketClose = exports.onSocketMessage = exports.onSocketError = exports.handleUpgrade = void 0;
const jwt_1 = require("next-auth/jwt");
const config_1 = require("./config");
const clientManager_1 = require("./clientManager");
const roomManager_1 = require("./roomManager");
const axios_1 = __importDefault(require("axios"));
const handleUpgrade = (wss) => (request, socket, head) => __awaiter(void 0, void 0, void 0, function* () {
    socket.on('error', onSocketPreError);
    // Extract the JWT token from the request headers
    const cookies = request.headers.cookie;
    if (!cookies) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
    }
    const cookieArray = cookies.split(';');
    // Find the cookie that contains the JWT token
    const tokenCookie = cookieArray.find((cookie) => cookie.trim().startsWith('next-auth.session-token'));
    if (!tokenCookie) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
    }
    const token = tokenCookie.split('=')[1];
    // Decode the JWT token
    const decoded = yield (0, jwt_1.decode)({
        token: token,
        secret: config_1.jwtSecret
    });
    if (!decoded) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
    }
    // Token is valid, proceed with the WebSocket upgrade
    wss.handleUpgrade(request, socket, head, (ws) => {
        socket.removeListener('error', onSocketPreError);
        wss.emit('connection', ws, request);
    });
});
exports.handleUpgrade = handleUpgrade;
function onSocketPreError(error) {
    console.error('WebSocket server error: ', error);
}
const onSocketError = (error) => {
    console.error('WebSocket post http error', error);
};
exports.onSocketError = onSocketError;
const onSocketMessage = (ws) => (message) => {
    const data = JSON.parse(message.toString());
    const { type, roomId, userId } = data;
    if (type === 'join') {
        (0, clientManager_1.addClient)(ws, userId, roomId);
        (0, roomManager_1.joinRoom)(roomId, ws, userId);
    }
    if (type === 'joinQueue') {
        (0, roomManager_1.joinRoomQueue)(roomId, ws, userId);
    }
};
exports.onSocketMessage = onSocketMessage;
const onSocketClose = (ws) => () => __awaiter(void 0, void 0, void 0, function* () {
    const user = (0, clientManager_1.getClient)(ws);
    if (user) {
        const userId = (0, clientManager_1.removeClient)(ws);
        if (!userId) {
            return;
        }
        (0, roomManager_1.leaveRoom)(user.roomId, ws, userId);
        if ((0, roomManager_1.getRoomSize)(user.roomId) === 0) {
            yield axios_1.default.patch(`http://localhost:3000/api/linkroom/remove?roomId=${user.roomId}`);
        }
    }
});
exports.onSocketClose = onSocketClose;

import { WebSocket } from 'ws'

const rooms: Record<string, Set<WebSocket>> = {}

export const joinRoom = (roomId: string, ws: WebSocket, userId: string) => {
	if (!rooms[roomId]) {
		rooms[roomId] = new Set()
	}
	if (!rooms[roomId].has(ws)) {
		rooms[roomId].add(ws)
		notifyClients(roomId, 'userJoined', { roomId, userId: userId })
	}
}

export const joinRoomQueue = (roomId: string, ws: WebSocket, userId: string) => {
	if (!rooms[roomId]) {
		return
	}

	if (!rooms[roomId].has(ws)) {
		notifyClients(roomId, 'userJoinedQueue', { roomId, userId: userId })
	}
}

export const leaveRoom = (roomId: string, ws: WebSocket, userId: string) => {
	if (rooms[roomId]) {
		rooms[roomId].delete(ws)
		notifyClients(roomId, 'userLeft', { userId: userId })
	}
}

export const notifyClients = (roomId: string, type: string, data: any) => {
	if (rooms[roomId]) {
		rooms[roomId].forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify({ type, ...data }))
			}
		})
	}
}

export const getRoomSize = (roomId: string) => {
	return rooms[roomId] ? rooms[roomId].size : 0
}

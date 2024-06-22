import { WebSocket } from 'ws'

const connectedClients: Map<WebSocket, { userId: string; roomId: string }> = new Map()

export const addClient = (ws: WebSocket, userId: string, roomId: string) => {
	connectedClients.set(ws, { userId, roomId })
}

export const removeClient = (ws: WebSocket) => {
	const user = connectedClients.get(ws)

	connectedClients.delete(ws)

	return user?.userId
}

export const getClient = (ws: WebSocket) => {
	return connectedClients.get(ws)
}

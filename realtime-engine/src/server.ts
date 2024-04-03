import { startServer } from './webSocketServer'
import { onSocketError, onSocketMessage, onSocketClose } from './utils'

const wss = startServer()

wss.on('connection', (ws) => {
	ws.on('error', onSocketError)
	ws.on('message', onSocketMessage(ws))
	ws.on('close', onSocketClose(ws))
})

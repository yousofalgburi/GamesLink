import { WebSocketServer } from 'ws'
import express from 'express'
import { port } from './config'
import { handleUpgrade } from './utils'

const app = express()
const wss = new WebSocketServer({ noServer: true })

export const startServer = () => {
	const server = app.listen(port, () => {
		console.log(`Server is running on port ${port}`)
	})

	server.on('upgrade', handleUpgrade(wss))

	return wss
}

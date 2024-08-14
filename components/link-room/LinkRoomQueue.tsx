'use client'

import { useMemo } from 'react'

export default function LinkRoomQueue({ wsLink, roomId, userId }: { wsLink: string; roomId: string; userId: string }) {
	const ws = useMemo(() => {
		return new WebSocket(wsLink)
	}, [wsLink])

	ws.onopen = () => {
		ws.send(JSON.stringify({ type: 'joinQueue', roomId, userId: userId }))
	}

	return <div className='grid grid-cols-2 gap-10'>You are in queue. Waiting for the host to let you in.</div>
}

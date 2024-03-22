'use client'

import { useEffect, useMemo } from 'react'

export default function LinkRoomQueue({ roomId, userId }: { roomId: string; userId: string }) {
    const ws = useMemo(() => {
        return new WebSocket(`ws://localhost:8000`)
    }, [])

    ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'joinQueue', roomId, userId: userId }))
    }

    return <div className="grid grid-cols-2 gap-10">You are in queue. Waiting for the host to let you in.</div>
}

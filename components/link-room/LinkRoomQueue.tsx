'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Button } from '../ui/button'
import { useToast } from '../ui/use-toast'
import type { User } from 'next-auth'

export default function LinkRoomQueue({
	wsLink,
	roomId,
	user,
}: {
	wsLink: string
	roomId: string
	user: User
}) {
	const { toast } = useToast()
	const router = useRouter()
	const wsRef = useRef<WebSocket | null>(null)
	const [isQueued, setIsQueued] = useState(false)

	useEffect(() => {
		const ws = new WebSocket(wsLink)
		wsRef.current = ws

		ws.onopen = () => {
			console.log('WebSocket connected')
		}

		ws.onmessage = (event) => {
			const data = JSON.parse(event.data)
			if (data.type === 'userAccepted' && data.userId === user.id) {
				toast({
					title: 'Accepted',
					description: 'You have been accepted into the room.',
				})
				router.push(`/link-room/${roomId}`)
			}
		}

		return () => {
			if (wsRef.current) {
				wsRef.current.close()
			}
		}
	}, [wsLink, user, roomId, router, toast])

	const handleJoinQueue = async () => {
		try {
			await axios.get(`/api/linkroom/events/queue?roomId=${roomId}&userId=${user.id}`)
			wsRef.current?.send(JSON.stringify({ type: 'joinQueue', roomId, user: JSON.stringify(user) }))
			setIsQueued(true)
			toast({
				title: 'Joined Queue',
				description: 'You have been added to the room queue.',
			})
		} catch (error) {
			console.error('Error joining queue:', error)
			toast({
				title: 'Error',
				description: 'Failed to join queue',
				variant: 'destructive',
			})
		}
	}

	return (
		<div className='flex flex-col items-center justify-center min-h-screen'>
			<h1 className='text-3xl font-bold mb-4'>Link Room Queue</h1>
			<p className='mb-8'>Wait for the host to let you in to the room.</p>
			<Button onClick={handleJoinQueue} disabled={isQueued}>
				{isQueued ? 'Waiting in Queue' : 'Join Queue'}
			</Button>
		</div>
	)
}

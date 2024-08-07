'use client'

import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { useToast } from '../ui/use-toast'
import type { UserInRoom } from '@/types/linkroom'
import LinkRoomPlayers from './LinkRoomPlayers'
import LowPlayersAvatar from './LowPlayersAvatar'
import LinkRoomHeader from './LinkRoomHeader'
import type { InferSelectModel } from 'drizzle-orm'
import type { rooms, users } from '@/db/schema'

export default function LinkRoom({
	roomId,
	userId,
	roomUsers,
	roomDetails,
}: {
	roomId: string
	userId: string
	roomUsers: UserInRoom[]
	roomDetails: InferSelectModel<typeof rooms>
}) {
	const { toast } = useToast()
	const [usersInRoom, setUsersInRoom] = useState<UserInRoom[]>(roomUsers)
	const [userLowGameCount, setUserLowGameCount] = useState(false)
	const [waitList, setWaitList] = useState<InferSelectModel<typeof users>[]>([])
	const [publicAccess, setPublicAccess] = useState(roomDetails.isPublic)

	const wsRef = useRef<WebSocket | null>(null)

	// useEffect(() => {
	// 	const ws = new WebSocket('ws://localhost:8000')
	// 	wsRef.current = ws

	// 	ws.onopen = () => {
	// 		ws.send(JSON.stringify({ type: 'join', roomId, userId: userId }))
	// 	}

	// 	ws.onmessage = async (event) => {
	// 		try {
	// 			const data: { type: string; roomId: string; userId: string } = JSON.parse(event.data)

	// 			if (data.type === 'userJoined') {
	// 				if (!usersInRoom.find((user) => user.id === data.userId)) {
	// 					const { data: user } = await axios.get(`/api/linkroom/events/join?userId=${data.userId}&roomId=${roomId}`)
	// 					setUsersInRoom((prevUsers) => [...prevUsers, { ...user.user, games: user.games }])
	// 					if (user.games.length < 5) {
	// 						setUserLowGameCount(true)
	// 						setTimeout(() => {
	// 							setUserLowGameCount(false)
	// 						}, 10000)
	// 					}
	// 				}
	// 			} else if (data.type === 'userLeft') {
	// 				setUsersInRoom((prevUsers) => prevUsers.filter((user) => user.id !== data.userId))
	// 				await axios.patch(`/api/linkroom/events/leave?userId=${data.userId}&roomId=${roomId}`)
	// 			} else if (data.type === 'userJoinedQueue') {
	// 				const { data: user } = await axios.get(`/api/linkroom/events/join/queue?userId=${data.userId}&roomId=${roomId}`)
	// 				if (!waitList.find((u) => u.id === user.id)) {
	// 					setWaitList((prevUsers) => [...prevUsers, user.user])
	// 				}
	// 			}
	// 		} catch (error) {
	// 			console.error('Error handling WebSocket message:', error)
	// 		}
	// 	}

	// 	return () => {
	// 		ws.close()
	// 	}
	// }, [userId, roomId])

	return (
		<>
			{userLowGameCount && <LowPlayersAvatar />}

			<div className='grid items-start gap-8'>
				<LinkRoomHeader
					userId={userId}
					roomId={roomId}
					usersInRoom={usersInRoom}
					roomDetails={roomDetails}
					waitList={waitList}
					publicAccess={publicAccess}
					setPublicAccess={setPublicAccess}
				/>

				<div className='grid grid-cols-1 gap-10 lg:grid-cols-2'>
					<LinkRoomPlayers usersInRoom={usersInRoom} roomDetails={roomDetails} userId={userId} />
					<Card>
						<CardContent className='flex h-full w-full items-center justify-center p-4'>
							<Button
								onClick={() => {
									toast({
										title: 'Copied',
										description: 'The invite link has been copied to your clipboard',
									})
									navigator.clipboard.writeText(window.location.href)
								}}
							>
								Copy Invite Link
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	)
}

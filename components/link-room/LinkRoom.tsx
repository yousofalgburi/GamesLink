'use client'

import axios from 'axios'
import { useRef, useState } from 'react'
import { GamepadIcon } from 'lucide-react'
import type { UserInRoom } from '@/types/linkroom'
import type { InferSelectModel } from 'drizzle-orm'
import type { rooms, users } from '@/db/schema'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useToast } from '../ui/use-toast'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel'
import { UserAvatar } from '../UserAvatar'
import GameCard from '../GameCard'

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
			{userLowGameCount && (
				<Alert className='mb-8'>
					<GamepadIcon className='h-4 w-4' />
					<AlertTitle>Heads up!</AlertTitle>
					<AlertDescription>A User has less than 5 games, results wont be useful unless all users have at least 5 games.</AlertDescription>
				</Alert>
			)}

			<div className='grid items-start gap-8'>
				<div className='flex justify-between'>
					<div className='flex items-center gap-2'>
						<h1 className='text-3xl font-bold md:text-4xl'>Link Room ({usersInRoom.length}/10)</h1>
						<p className='truncate text-sm text-muted-foreground'>Created on {roomDetails.createdAt.toLocaleString()}</p>
					</div>

					<div className='flex gap-4'>
						<Dialog>
							<DialogTrigger asChild>
								<Button disabled={roomDetails.hostId !== userId} variant='outline'>
									Show Room Queue
								</Button>
							</DialogTrigger>
							<DialogContent className='sm:max-w-[425px]'>
								<DialogHeader>
									<DialogTitle>Users Wait List</DialogTitle>
									<DialogDescription>Users waiting to join room.</DialogDescription>
								</DialogHeader>
								<div className='grid gap-4 py-4'>
									{waitList.length ? (
										waitList.map((user) => (
											<div key={user.name} className='flex items-center justify-between'>
												<div className='flex items-center gap-2'>
													<UserAvatar user={user} />
													<Label htmlFor='name'>{user.name}</Label>
												</div>

												<div className='flex gap-2'>
													<Button size='sm'>Accept</Button>
												</div>
											</div>
										))
									) : (
										<Label>No users in queue</Label>
									)}
								</div>
							</DialogContent>
						</Dialog>

						<div className='flex items-center space-x-2'>
							<Switch
								checked={publicAccess}
								onCheckedChange={async (e) => {
									setPublicAccess(e)
									await axios.patch(`/api/linkroom/events/access?roomId=${roomId}&publicAccess=${e}`)
								}}
								id='airplane-mode'
								disabled={roomDetails.hostId !== userId}
							/>
							<Label htmlFor='airplane-mode'>Public</Label>
						</div>

						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button disabled>Roll!</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>This feature is still in progress. Coming soon!</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				</div>

				<div className='grid grid-cols-1 gap-10 lg:grid-cols-2'>
					<>
						{usersInRoom.map((user) => (
							<Card key={user.id}>
								<CardHeader>
									<CardTitle>
										<div className='flex items-center gap-2'>
											<UserAvatar user={{ name: user.name || null, image: user.image || null }} />
											{user.name} {roomDetails.hostId === user.id ? '(Host)' : ''}
										</div>
									</CardTitle>
									<CardDescription>
										{user.username} ({user.credits} Credits)
									</CardDescription>
								</CardHeader>
								<CardContent>
									{user?.games.length === 0 ? (
										<p className='text-lg font-light'>No games found for this user.</p>
									) : (
										<>
											<p className='pb-2 text-2xl font-medium'>Games ({user?.games.length}):</p>

											<Carousel>
												<CarouselContent>
													{user.games.map((game) => {
														return (
															<CarouselItem key={game.id} className='flex basis-full gap-2 lg:basis-1/2'>
																<GameCard
																	className='h-[28rem]'
																	nowidth={true}
																	key={game.steamAppid}
																	votesAmt={game.voteCount}
																	currentVote={game.voteType}
																	game={game}
																/>
															</CarouselItem>
														)
													})}
												</CarouselContent>

												<CarouselPrevious />
												<CarouselNext />
											</Carousel>
										</>
									)}
								</CardContent>
							</Card>
						))}
					</>

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

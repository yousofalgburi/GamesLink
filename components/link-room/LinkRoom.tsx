'use client'

import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { GamepadIcon, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
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
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel'
import { UserAvatar } from '../UserAvatar'
import GameCard from '../GameCard'
import type { ExtendedGame } from '@/types/db'
import { useRouter } from 'next/navigation'

export default function LinkRoom({
	wsLink,
	roomId,
	userId,
	roomUsers,
	roomDetails,
	initialRolls,
	initialWaitList,
}: {
	wsLink: string
	roomId: string
	userId: string
	roomUsers: UserInRoom[]
	roomDetails: InferSelectModel<typeof rooms>
	initialRolls: { id: number; games: ExtendedGame[] }[]
	initialWaitList: InferSelectModel<typeof users>[]
}) {
	const { toast } = useToast()
	const [usersInRoom, setUsersInRoom] = useState<UserInRoom[]>(roomUsers)
	const [userLowGameCount, setUserLowGameCount] = useState(false)
	const [waitList, setWaitList] = useState<InferSelectModel<typeof users>[]>(initialWaitList)
	const [publicAccess, setPublicAccess] = useState(roomDetails.isPublic)
	const [isRolling, setIsRolling] = useState(false)

	const [allRolledGames, setAllRolledGames] = useState<number[]>(initialRolls.flatMap((roll) => roll.games.map((game) => game.id)))

	const [rolls, setRolls] = useState<{ id: number; games: ExtendedGame[] }[]>(initialRolls.sort((a, b) => b.id - a.id))
	const [currentRollIndex, setCurrentRollIndex] = useState(0)

	const wsRef = useRef<WebSocket | null>(null)
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	const router = useRouter()

	const fetchRoomMembers = async () => {
		try {
			const response = await axios.get(`/api/linkroom/members?roomId=${roomId}`)
			setUsersInRoom(response.data)
		} catch (error) {
			console.error('Error fetching room members:', error)
			toast({
				title: 'Error',
				description: 'Failed to fetch room members',
				variant: 'destructive',
			})
		}
	}

	const fetchRolls = async () => {
		try {
			const response = await axios.get(`/api/linkroom/rolls?roomId=${roomId}`)
			setRolls(response.data)
			setCurrentRollIndex(0)
		} catch (error) {
			console.error('Error fetching rolls:', error)
			toast({
				title: 'Error',
				description: 'Failed to fetch roll results',
				variant: 'destructive',
			})
		}
	}

	const handleAcceptUser = async (userId: string) => {
		try {
			await axios.post('/api/linkroom/accept', { roomId, userId })
			setWaitList((prev) => prev.filter((user) => user.id !== userId))
			await fetchRoomMembers()
			toast({
				title: 'User accepted',
				description: 'The user has been added to the room.',
			})
		} catch (error) {
			console.error('Error accepting user:', error)
			toast({
				title: 'Error',
				description: 'Failed to accept user',
				variant: 'destructive',
			})
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		let isComponentMounted = true

		const connectWebSocket = () => {
			if (!isComponentMounted || wsRef.current?.readyState === WebSocket.OPEN) return

			const ws = new WebSocket(wsLink)
			wsRef.current = ws

			ws.onopen = () => {
				console.log('WebSocket connected')
				ws.send(JSON.stringify({ type: 'join', roomId, userId }))
			}

			ws.onmessage = async (event) => {
				try {
					const data = JSON.parse(event.data)
					console.log('Received message:', data.type)

					if (data.type === 'userJoined' || data.type === 'userLeft') {
						await fetchRoomMembers()
					} else if (data.type === 'newRollAvailable') {
						await fetchRolls()
						toast({
							title: 'New roll available',
							description: 'Check out the new recommended games!',
						})
					} else if (data.type === 'userJoinedQueue') {
						const newUser = JSON.parse(data.user)
						setWaitList((prev) => [...prev, newUser])
					} else if (data.type === 'userAccepted' && data.userId === userId) {
						router.refresh()
					}
				} catch (error) {
					console.error('Error handling WebSocket message:', error)
				}
			}

			ws.onerror = (error) => {
				console.error('WebSocket error:', error)
			}

			ws.onclose = (event) => {
				console.log('WebSocket closed:', event.code, event.reason)
				if (isComponentMounted) {
					reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000)
				}
			}
		}

		connectWebSocket()

		return () => {
			isComponentMounted = false
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current)
			}
			if (wsRef.current) {
				wsRef.current.close()
			}
		}
	}, [userId, roomId, wsLink])

	const handleRoll = async () => {
		setIsRolling(true)
		try {
			const response = await axios.post('/api/linkroom/roll', {
				roomId,
				previousRolls: allRolledGames,
				saveRoll: true,
			})

			const { newRecommendations, allRolledGames: updatedRolledGames, rollNumber } = response.data

			setAllRolledGames(updatedRolledGames)
			setRolls((prevRolls) => [
				{
					id: rollNumber,
					games: newRecommendations.map((game: ExtendedGame) => ({
						...game,
						voteType: null,
					})),
				},
				...prevRolls,
			])
			setCurrentRollIndex(0)

			wsRef.current?.send(
				JSON.stringify({
					type: 'requestRoll',
					roomId,
					userId,
				}),
			)

			toast({
				title: 'Roll successful',
				description: 'Check out the new recommended games!',
			})
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing your request.'
			toast({
				title: 'Roll failed',
				description: axios.isAxiosError(error) && error.response?.data ? error.response.data : errorMessage,
				variant: 'destructive',
			})
		} finally {
			setIsRolling(false)
		}
	}

	const navigateRoll = (direction: 'prev' | 'next') => {
		setCurrentRollIndex((prevIndex) => {
			if (direction === 'prev') {
				return Math.min(prevIndex + 1, rolls.length - 1)
			}
			return Math.max(prevIndex - 1, 0)
		})
	}

	return (
		<div className='container max-w-full mx-auto px-4'>
			{userLowGameCount && (
				<Alert className='mb-8'>
					<GamepadIcon className='h-4 w-4' />
					<AlertTitle>Heads up!</AlertTitle>
					<AlertDescription>A User has less than 5 games, results won't be useful unless all users have at least 5 games.</AlertDescription>
				</Alert>
			)}

			<div className='space-y-8'>
				<div className='flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center'>
					<div>
						<h1 className='text-2xl font-bold sm:text-3xl md:text-4xl'>Link Room ({usersInRoom.length}/10)</h1>
						<p className='text-sm text-muted-foreground'>Created on {roomDetails.createdAt.toLocaleString()}</p>
					</div>

					<div className='flex flex-wrap gap-2'>
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
											<div key={user.id} className='flex items-center justify-between'>
												<div className='flex items-center gap-2'>
													<UserAvatar user={user} />
													<Label htmlFor='name'>{user.name}</Label>
												</div>
												<div className='flex gap-2'>
													<Button size='sm' onClick={() => handleAcceptUser(user.id)}>
														Accept
													</Button>
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
								id='public-access'
								disabled={roomDetails.hostId !== userId}
							/>
							<Label htmlFor='public-access'>Public</Label>
						</div>

						<Button onClick={handleRoll} disabled={isRolling || roomDetails.hostId !== userId}>
							{isRolling ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Rolling...
								</>
							) : (
								'Roll!'
							)}
						</Button>
					</div>
				</div>

				{rolls.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className='flex justify-between items-center flex-wrap gap-2'>
								<span>Recommended Games</span>
								<div className='flex items-center gap-2'>
									<Button
										variant='outline'
										size='icon'
										onClick={() => navigateRoll('prev')}
										disabled={currentRollIndex === rolls.length - 1}
									>
										<ChevronLeft className='h-4 w-4' />
									</Button>
									<span>Roll #{rolls[currentRollIndex].id}</span>
									<Button variant='outline' size='icon' onClick={() => navigateRoll('next')} disabled={currentRollIndex === 0}>
										<ChevronRight className='h-4 w-4' />
									</Button>
								</div>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
								{rolls[currentRollIndex].games.map((game) => (
									<GameCard
										key={game.id}
										className='h-full'
										nowidth={true}
										game={game}
										votesAmt={game.voteCount}
										currentVote={undefined}
										smallDescription={true}
									/>
								))}
							</div>
						</CardContent>
					</Card>
				)}

				<div className='grid gap-12 sm:grid-cols-2'>
					{usersInRoom.map((user) => (
						<Card key={user.id}>
							<CardHeader>
								<CardTitle>
									<div className='flex items-center gap-2'>
										<UserAvatar user={{ name: user.name || null, image: user.image || null }} />
										<div>
											<div>
												{user.name} {roomDetails.hostId === user.id ? '(Host)' : ''}
											</div>
											<CardDescription>
												{user.username} ({user.credits} Credits)
											</CardDescription>
										</div>
									</div>
								</CardTitle>
							</CardHeader>
							<CardContent>
								{user?.games.length === 0 ? (
									<p className='text-lg font-light'>No games found for this user.</p>
								) : (
									<>
										<p className='pb-2 text-xl font-medium'>Games ({user?.games.length}):</p>
										<Carousel>
											<CarouselContent className='-ml-2 md:-ml-4'>
												{user.games.map((game) => (
													<CarouselItem key={game.id} className='pl-2 md:pl-4 basis-full md:basis-1/2'>
														<GameCard
															className='h-full'
															nowidth={true}
															key={game.steamAppid}
															votesAmt={game.voteCount}
															currentVote={game.voteType}
															game={game}
															smallDescription={true}
														/>
													</CarouselItem>
												))}
											</CarouselContent>
											<CarouselPrevious />
											<CarouselNext />
										</Carousel>
									</>
								)}
							</CardContent>
						</Card>
					))}
				</div>

				<Card>
					<CardContent className='flex items-center justify-center p-4'>
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
	)
}

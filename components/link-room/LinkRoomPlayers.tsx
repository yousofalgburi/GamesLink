'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel'
import type { UserInRoom } from '@/types/linkroom'
import GameCard from '../GameCard'
import type { Room } from '@prisma/client'
import { UserAvatar } from '../UserAvatar'
import type { VoteType } from '@/constants/enums'

export default function LinkRoomPlayers({
	usersInRoom,
	roomDetails,
	userId,
}: {
	usersInRoom: UserInRoom[]
	roomDetails: Room
	userId: string
}) {
	return (
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
											const votesAmt = game.votes.reduce((acc, vote) => {
												if (vote.type === 'UP') return acc + 1
												if (vote.type === 'DOWN') return acc - 1
												return acc
											}, 0)

											const currentVote = game.votes.find((vote) => vote.userId === userId)

											return (
												<CarouselItem key={game.id} className='flex basis-full gap-2 lg:basis-1/2'>
													<GameCard
														className='h-[28rem]'
														nowidth={true}
														key={game.id}
														votesAmt={votesAmt}
														currentVote={currentVote?.type as VoteType}
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
	)
}

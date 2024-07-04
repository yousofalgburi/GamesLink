import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { GameVoteValidator } from '@/lib/validators/vote'
import { z } from 'zod'
import { redis } from '@/lib/redis'
import type { CachedGame } from '@/types/redis'

const CACHE_AFTER_UPVOTES = 1

export async function PATCH(req: Request) {
	const updateVoteCount = async (gameId: number) => {
		const gameInteraction = await db.gameInteraction.findUnique({
			where: { appId: gameId.toString() },
			include: { votes: true },
		})

		if (!gameInteraction) {
			return 0
		}

		const votesAmt = gameInteraction.votes.reduce((acc, vote) => {
			if (vote.type === 'UP') return acc + 1
			if (vote.type === 'DOWN') return acc - 1
			return acc
		}, 0)

		await db.gameInteraction.update({
			where: { appId: gameId.toString() },
			data: { voteCount: votesAmt },
		})

		return votesAmt
	}

	try {
		const body = await req.json()

		const { gameId: gameIdString, voteType } = GameVoteValidator.parse(body)
		const gameId = Number(gameIdString)

		const session = await getAuthSession()

		if (!session?.user) {
			return new Response('Unauthorized', { status: 401 })
		}

		let gameInteraction = await db.gameInteraction.findUnique({
			where: {
				appId: gameId.toString(),
			},
		})

		if (!gameInteraction) {
			gameInteraction = await db.gameInteraction.create({
				data: {
					appId: gameId.toString(),
				},
			})
		}

		// check if user has already voted on this game
		const existingVote = await db.vote.findFirst({
			where: {
				userId: session.user.id,
				gameId: gameInteraction.id,
			},
		})

		if (existingVote) {
			// if vote type is the same as existing vote, delete the vote
			if (existingVote.type === voteType) {
				await db.vote.delete({
					where: {
						userId_gameId: {
							gameId: gameInteraction.id,
							userId: session.user.id,
						},
					},
				})

				const votesAmt = await updateVoteCount(gameId)

				if (votesAmt >= CACHE_AFTER_UPVOTES) {
					const processedGame = await db.processedGame.findUnique({
						where: { appId: gameId.toString() },
						include: {
							releaseDate: true,
							categories: true,
							genres: true,
						},
					})

					if (processedGame) {
						const cachePayload: CachedGame = {
							id: processedGame.id.toString(),
							steamAppId: processedGame.appId,
							name: processedGame.name,
							shortDescription: processedGame.shortDescription,
							headerImage: processedGame.headerImage,
							requiredAge: processedGame.requiredAge,
							isFree: processedGame.isFree,
							releaseDate: processedGame.releaseDate?.date ? new Date(processedGame.releaseDate.date) : undefined,
							developers: processedGame.developers.join(','),
							categories: processedGame.categories.map((c) => c.description).join(','),
							genres: processedGame.genres.map((g) => g.description).join(','),
						}

						await redis.hset(`game:${gameId}`, cachePayload) // Store the game data as a hash
					}
				}

				return new Response('OK')
			}

			// if vote type is different, update the vote
			await db.vote.update({
				where: {
					userId_gameId: {
						gameId: gameInteraction.id,
						userId: session.user.id,
					},
				},
				data: {
					type: voteType,
				},
			})

			const votesAmt = await updateVoteCount(gameId)

			if (votesAmt >= CACHE_AFTER_UPVOTES) {
				const processedGame = await db.processedGame.findUnique({
					where: { appId: gameId.toString() },
					include: {
						releaseDate: true,
						categories: true,
						genres: true,
					},
				})

				if (processedGame) {
					const cachePayload: CachedGame = {
						id: processedGame.id.toString(),
						steamAppId: processedGame.appId,
						name: processedGame.name,
						shortDescription: processedGame.shortDescription,
						headerImage: processedGame.headerImage,
						requiredAge: processedGame.requiredAge,
						isFree: processedGame.isFree,
						releaseDate: processedGame.releaseDate?.date ? new Date(processedGame.releaseDate.date) : undefined,
						developers: processedGame.developers.join(','),
						categories: processedGame.categories.map((c) => c.description).join(','),
						genres: processedGame.genres.map((g) => g.description).join(','),
					}

					await redis.hset(`game:${gameId}`, cachePayload) // Store the game data as a hash
				}
			}

			return new Response('OK')
		}

		// if no existing vote, create a new vote
		await db.vote.create({
			data: {
				type: voteType,
				userId: session.user.id,
				gameId: gameInteraction.id,
			},
		})

		const votesAmt = await updateVoteCount(gameId)

		if (votesAmt >= CACHE_AFTER_UPVOTES) {
			const processedGame = await db.processedGame.findUnique({
				where: { appId: gameId.toString() },
				include: {
					releaseDate: true,
					categories: true,
					genres: true,
				},
			})

			if (processedGame) {
				const cachePayload: CachedGame = {
					id: processedGame.id.toString(),
					steamAppId: processedGame.appId,
					name: processedGame.name,
					shortDescription: processedGame.shortDescription,
					headerImage: processedGame.headerImage,
					requiredAge: processedGame.requiredAge,
					isFree: processedGame.isFree,
					releaseDate: processedGame.releaseDate?.date ? new Date(processedGame.releaseDate.date) : undefined,
					developers: processedGame.developers.join(','),
					categories: processedGame.categories.map((c) => c.description).join(','),
					genres: processedGame.genres.map((g) => g.description).join(','),
				}

				await redis.hset(`game:${gameId}`, cachePayload) // Store the game data as a hash
			}
		}

		return new Response('OK')
	} catch (error) {
		console.log(error)

		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		return new Response('Could not vote on game at this time. Please try later', { status: 500 })
	}
}

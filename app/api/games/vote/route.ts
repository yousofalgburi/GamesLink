import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { GameVoteValidator } from '@/lib/validators/vote'
import { z } from 'zod'
import { redis } from '@/lib/redis'
import type { CachedGame } from '@/types/redis'

const CACHE_AFTER_UPVOTES = 1

export async function PATCH(req: Request) {
	const updatVoteCount = async (gameId: number) => {
		const updatedGame = await db.processedGame.findUnique({
			where: { appId: gameId.toString() },
			include: { votes: true },
		})

		if (!updatedGame) {
			return 0
		}

		const votesAmt = updatedGame.votes.reduce((acc, vote) => {
			if (vote.type === 'UP') return acc + 1
			if (vote.type === 'DOWN') return acc - 1
			return acc
		}, 0)

		await db.processedGame.update({
			where: { appId: gameId.toString() },
			data: { voteCount: votesAmt },
		})

		return votesAmt
	}

	try {
		const body = await req.json()

		const { gameId: gameIdString, voteType } = GameVoteValidator.parse(body)
		const gameId = Number.parseInt(gameIdString)

		const session = await getAuthSession()

		if (!session?.user) {
			return new Response('Unauthorized', { status: 401 })
		}

		// check if user has already voted on this game
		const game = await db.processedGame.findUnique({
			where: {
				appId: gameId.toString(),
			},
			include: {
				releaseDate: true,
				categories: true,
				genres: true,
				votes: true,
			},
		})

		if (!game) {
			return new Response('Game not found', { status: 404 })
		}

		const existingVote = await db.vote.findFirst({
			where: {
				userId: session.user.id,
				gameId: game.id,
			},
		})

		if (!game) {
			return new Response('Game not found', { status: 404 })
		}

		if (existingVote) {
			// if vote type is the same as existing vote, delete the vote
			if (existingVote.type === voteType) {
				await db.vote.delete({
					where: {
						userId_gameId: {
							gameId: game.id,
							userId: session.user.id,
						},
					},
				})

				const votesAmt = await updatVoteCount(gameId)

				if (votesAmt >= CACHE_AFTER_UPVOTES) {
					const cachePayload: CachedGame = {
						id: game.id.toString(),
						steamAppId: game?.steamAppid?.toString() ?? '',
						name: game.name,
						shortDescription: game.shortDescription,
						headerImage: game.headerImage,
						requiredAge: game.requiredAge,
						isFree: game.isFree,
						releaseDate: game.releaseDate?.date ? new Date(game.releaseDate.date) : undefined,
						developers: game.developers,
						categories: game.categories.map((category) => category.description).join(','),
						genres: game.genres.map((genre) => genre.description).join(','),
					}

					await redis.hset(`game:${gameId}`, cachePayload) // Store the game data as a hash
				}

				return new Response('OK')
			}

			// if vote type is different, update the vote
			await db.vote.update({
				where: {
					userId_gameId: {
						gameId: game.id,
						userId: session.user.id,
					},
				},
				data: {
					type: voteType,
				},
			})

			const votesAmt = await updatVoteCount(gameId)

			if (votesAmt >= CACHE_AFTER_UPVOTES) {
				const cachePayload: CachedGame = {
					id: game.id.toString(),
					steamAppId: game?.steamAppid?.toString() ?? '',
					name: game.name,
					shortDescription: game.shortDescription,
					headerImage: game.headerImage,
					requiredAge: game.requiredAge,
					isFree: game.isFree,
					releaseDate: game.releaseDate?.date ? new Date(game.releaseDate.date) : undefined,
					developers: game.developers,
					categories: game.categories.map((category) => category.description).join(','),
					genres: game.genres.map((genre) => genre.description).join(','),
				}

				await redis.hset(`game:${gameId}`, cachePayload) // Store the game data as a hash
			}

			return new Response('OK')
		}

		// if no existing vote, create a new vote
		await db.vote.create({
			data: {
				type: voteType,
				userId: session.user.id,
				gameId: game.id,
			},
		})

		const votesAmt = await updatVoteCount(gameId)

		if (votesAmt >= CACHE_AFTER_UPVOTES) {
			const cachePayload: CachedGame = {
				id: game.id.toString(),
				steamAppId: game?.steamAppid?.toString() ?? '',
				name: game.name,
				shortDescription: game.shortDescription,
				headerImage: game.headerImage,
				requiredAge: game.requiredAge,
				isFree: game.isFree,
				releaseDate: game.releaseDate?.date ? new Date(game.releaseDate.date) : undefined,
				developers: game.developers,
				categories: game.categories.map((category) => category.description).join(','),
				genres: game.genres.map((genre) => genre.description).join(','),
			}

			await redis.hset(`game:${gameId}`, cachePayload) // Store the game data as a hash
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

import { auth } from '@/auth'
import { db } from '@/lib/db/index'
import { GameVoteValidator } from '@/lib/validators/vote'
import { redis } from '@/lib/redis'
import type { CachedGame } from '@/types/redis'
import { gameVotes, processedGames } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

const CACHE_AFTER_UPVOTES = 1

export async function PATCH(req: Request) {
	const updateVoteCount = async (gameId: number) => {
		const [updatedGame] = await db.selectDistinct().from(processedGames).where(eq(processedGames.steamAppid, gameId))

		if (!updatedGame) {
			return 0
		}

		const totalVotes = await db.select().from(gameVotes).where(eq(gameVotes.gameId, updatedGame.id))

		const votesAmt = totalVotes.reduce((acc, vote) => {
			if (vote.voteType === 'UP') return acc + 1
			if (vote.voteType === 'DOWN') return acc - 1
			return acc
		}, 0)

		await db
			.update(processedGames)
			.set({
				voteCount: votesAmt,
			})
			.where(eq(processedGames.steamAppid, gameId))

		return votesAmt
	}

	try {
		const body = await req.json()

		const { gameId: gameIdString, voteType } = GameVoteValidator.parse(body)
		const gameId = Number.parseInt(gameIdString)

		const session = await auth()

		if (!session?.user) {
			return new Response('Unauthorized', { status: 401 })
		}

		const [game] = await db.select().from(processedGames).where(eq(processedGames.steamAppid, gameId))

		console.log('found game')

		if (!game) {
			return new Response('Game not found', { status: 404 })
		}

		console.log('searching for exisiting vote', {
			userId: session.user.id,
			gameId: game.id,
		})

		const [existingVote] = await db
			.selectDistinct()
			.from(gameVotes)
			.where(and(eq(gameVotes.userId, session.user.id), eq(gameVotes.gameId, game.id)))

		if (existingVote) {
			if (existingVote.voteType === voteType) {
				await db.delete(gameVotes).where(and(eq(gameVotes.userId, session.user.id), eq(gameVotes.gameId, game.id)))
			} else {
				await db
					.update(gameVotes)
					.set({
						voteType: voteType,
					})
					.where(and(eq(gameVotes.userId, session.user.id), eq(gameVotes.gameId, game.id)))
			}
		} else {
			await db.insert(gameVotes).values({
				gameId: game.id,
				userId: session.user.id,
				voteType: voteType,
			})
		}

		const votesAmt = await updateVoteCount(gameId)

		await db
			.update(processedGames)
			.set({
				voteCount: votesAmt,
			})
			.where(eq(processedGames.id, game.id))

		if (votesAmt >= CACHE_AFTER_UPVOTES) {
			const cachePayload: CachedGame = {
				id: game.id.toString(),
				steamAppId: game?.steamAppid?.toString() ?? '',
				name: game.name,
				shortDescription: game.shortDescription ?? '',
				headerImage: game.headerImage ?? '',
				requiredAge: game.requiredAge,
				isFree: game.isFree,
				releaseDate: game.releaseDate ? new Date(game.releaseDate) : undefined,
				developers: game.developers?.join(',') ?? '',
				categories: game.categories?.join(',') ?? '',
				genres: game.genres?.join(',') ?? '',
			}

			await redis.hset(`game:${gameId}`, cachePayload)
		}

		return new Response('OK')
	} catch (error) {
		console.error(error)
		return new Response('Could not vote on game at this time. Please try later', { status: 500 })
	}
}

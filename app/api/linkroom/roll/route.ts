import { z } from 'zod'
import { db } from '@/db'
import { rooms, users, gameVotes, processedGames, rollResults } from '@/db/schema'
import { eq, inArray, sql, not, and, or, arrayContains, desc } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import type { ExtendedGame } from '@/types/db'

const rollRequestValidator = z.object({
	roomId: z.string(),
	previousRolls: z.array(z.number()),
})

export async function POST(req: Request) {
	try {
		const { roomId, previousRolls } = rollRequestValidator.parse(await req.json())

		const [room] = await db.select().from(rooms).where(eq(rooms.roomId, roomId)).limit(1)
		if (!room) {
			return new Response('Room not found', { status: 404 })
		}

		const [host] = await db.select().from(users).where(eq(users.id, room.hostId)).limit(1)
		if (!host || host.credits < 1) {
			return new Response('Host does not have enough credits', { status: 400 })
		}

		await db
			.update(users)
			.set({ credits: sql`${users.credits} - 1` })
			.where(eq(users.id, room.hostId))

		const userGames = await db
			.select({
				id: processedGames.id,
				genres: processedGames.genres,
				categories: processedGames.categories,
			})
			.from(gameVotes)
			.innerJoin(processedGames, eq(gameVotes.gameId, processedGames.id))
			.where(inArray(gameVotes.userId, room.members ?? []))

		const genreCount: Record<string, number> = {}
		const categoryCount: Record<string, number> = {}
		for (const game of userGames) {
			if (game.genres) {
				for (const genre of game.genres) {
					genreCount[genre] = (genreCount[genre] || 0) + 1
				}
			}
			if (game.categories) {
				for (const category of game.categories) {
					categoryCount[category] = (categoryCount[category] || 0) + 1
				}
			}
		}

		const topGenres = Object.entries(genreCount)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 10)
			.map(([genre]) => genre)

		const topCategories = Object.entries(categoryCount)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 10)
			.map(([category]) => category)

		const userGameIds = userGames.map((game) => game.id)
		const allExcludedIds = [...userGameIds, ...previousRolls]

		const conditions: SQL<unknown>[] = [
			sql`${processedGames.type} = 'game'`,
			sql`${processedGames.nsfw} = false`,
			not(inArray(processedGames.id, allExcludedIds)),
		]

		if (topGenres.length > 0 || topCategories.length > 0) {
			const genreCondition = topGenres.length > 0 ? arrayContains(processedGames.genres, topGenres) : null
			const categoryCondition = topCategories.length > 0 ? arrayContains(processedGames.categories, topCategories) : null

			if (genreCondition && categoryCondition) {
				const combinedCondition = or(genreCondition, categoryCondition)
				if (combinedCondition) conditions.push(combinedCondition)
			} else if (genreCondition) {
				conditions.push(genreCondition)
			} else if (categoryCondition) {
				conditions.push(categoryCondition)
			}
		}

		const whereClause = and(...conditions)

		const recommendedGames = await db
			.select({
				id: processedGames.id,
				steamAppid: processedGames.steamAppid,
				name: processedGames.name,
				shortDescription: processedGames.shortDescription,
				headerImage: processedGames.headerImage,
				requiredAge: processedGames.requiredAge,
				isFree: processedGames.isFree,
				releaseDate: processedGames.releaseDate,
				developers: processedGames.developers,
				genres: processedGames.genres,
				categories: processedGames.categories,
				voteCount: processedGames.voteCount,
			})
			.from(processedGames)
			.where(whereClause)
			.orderBy(desc(processedGames.voteCount), desc(processedGames.releaseDate))
			.limit(5)

		const newRollIds = recommendedGames.map((game) => game.id)
		const allRolledGames = [...previousRolls, ...newRollIds]

		const gameViews: ExtendedGame[] = recommendedGames.map((game) => ({
			...game,
			shortDescription: game.shortDescription ?? '',
			headerImage: game.headerImage ?? '',
			releaseDate: game.releaseDate ?? null,
			developers: game.developers ?? [],
			genres: game.genres ?? [],
			categories: game.categories ?? [],
			voteType: null,
		}))

		const [lastRoll] = await db
			.select({ rollNumber: rollResults.rollNumber })
			.from(rollResults)
			.where(eq(rollResults.roomId, roomId))
			.orderBy(desc(rollResults.rollNumber))
			.limit(1)

		const newRollNumber = (lastRoll?.rollNumber ?? 0) + 1

		await db.insert(rollResults).values({
			roomId,
			rollNumber: newRollNumber,
			games: gameViews,
		})

		return new Response(
			JSON.stringify({
				newRecommendations: recommendedGames,
				allRolledGames,
				rollNumber: newRollNumber,
			}),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			},
		)
	} catch (error) {
		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}
		console.error('Roll error:', error)
		return new Response('Could not process roll request, please try again later.', { status: 500 })
	}
}

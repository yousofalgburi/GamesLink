import { auth } from '@/auth'
import { db } from '@/db'
import { roomEventValidator } from '@/lib/validators/linkroom'
import type { ExtendedGame } from '@/types/db'
import { z } from 'zod'
import { users, rooms, processedGames, gameVotes } from '@/db/schema'
import { eq, desc, and, sql } from 'drizzle-orm'

export async function GET(req: Request) {
	try {
		const session = await auth()

		if (!session?.user) {
			return new Response('Unauthorized', { status: 401 })
		}

		const url = new URL(req.url)
		const { userId, roomId } = roomEventValidator.parse({
			userId: url.searchParams.get('userId'),
			roomId: url.searchParams.get('roomId'),
		})

		const [user] = await db.select().from(users).where(eq(users.id, userId))

		if (!user) {
			return new Response('User not found', { status: 404 })
		}

		const games = (await db
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
				voteType: gameVotes.voteType,
			})
			.from(processedGames)
			.innerJoin(gameVotes, and(eq(gameVotes.gameId, processedGames.id), eq(gameVotes.userId, userId)))
			.orderBy(desc(processedGames.voteCount))) as ExtendedGame[]

		const result = await db
			.update(rooms)
			.set({
				queuedUsers: sql`array_append(${rooms.queuedUsers}, ${user.id})`,
			})
			.where(eq(rooms.roomId, roomId))
			.returning({ updatedRoom: rooms.queuedUsers })

		if (result.length === 0) {
			return new Response('Room not found', { status: 404 })
		}

		return new Response(JSON.stringify({ user, games }), { status: 201 })
	} catch (error) {
		console.error('Error queuing user and fetching games:', error)

		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		return new Response('Could not fetch user games, please try again later.', { status: 500 })
	}
}

import { auth } from '@/auth'
import { db } from '@/db'
import { z } from 'zod'
import { users, rooms, processedGames, gameVotes } from '@/db/schema'
import { eq, desc, and, inArray } from 'drizzle-orm'

const roomMembersValidator = z.object({
	roomId: z.string(),
})

export async function GET(req: Request) {
	try {
		const session = await auth()

		if (!session?.user) {
			return new Response('Unauthorized', { status: 401 })
		}

		const url = new URL(req.url)
		const { roomId } = roomMembersValidator.parse({
			roomId: url.searchParams.get('roomId'),
		})

		const [room] = await db.select().from(rooms).where(eq(rooms.roomId, roomId))

		if (!room) {
			return new Response('Room not found', { status: 404 })
		}

		const members = await db
			.select({
				id: users.id,
				name: users.name,
				image: users.image,
				username: users.username,
				credits: users.credits,
			})
			.from(users)
			.where(inArray(users.id, room.members ?? []))

		const games = await db
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
				userId: gameVotes.userId,
			})
			.from(processedGames)
			.innerJoin(gameVotes, eq(gameVotes.gameId, processedGames.id))
			.where(inArray(gameVotes.userId, room.members ?? []))
			.orderBy(desc(processedGames.voteCount))

		const memberGames = members.map((member) => ({
			...member,
			games: games.filter((game) => game.userId === member.id),
		}))

		return new Response(JSON.stringify(memberGames), { status: 200 })
	} catch (error) {
		console.error('Error fetching room members and games:', error)

		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		return new Response('Could not fetch room members and games, please try again later.', { status: 500 })
	}
}

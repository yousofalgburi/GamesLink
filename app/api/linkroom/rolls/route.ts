import { auth } from '@/auth'
import { db } from '@/db'
import { z } from 'zod'
import { rooms, rollResults } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

const rollsValidator = z.object({
	roomId: z.string(),
	limit: z.number().optional().default(10),
})

export async function GET(req: Request) {
	try {
		const session = await auth()

		if (!session?.user) {
			return new Response('Unauthorized', { status: 401 })
		}

		const url = new URL(req.url)
		const { roomId, limit } = rollsValidator.parse({
			roomId: url.searchParams.get('roomId'),
			limit: Number.parseInt(url.searchParams.get('limit') ?? '10'),
		})

		const [room] = await db.select().from(rooms).where(eq(rooms.roomId, roomId))

		if (!room) {
			return new Response('Room not found', { status: 404 })
		}

		const rolls = await db.select().from(rollResults).where(eq(rollResults.roomId, roomId)).orderBy(desc(rollResults.rollNumber)).limit(limit)

		return new Response(JSON.stringify(rolls), { status: 200 })
	} catch (error) {
		console.error('Error fetching roll results:', error)

		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		return new Response('Could not fetch roll results, please try again later.', { status: 500 })
	}
}

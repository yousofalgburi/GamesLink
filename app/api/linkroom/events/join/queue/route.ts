import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { roomEventValidator } from '@/lib/validators/linkroom/events'
import type { User } from '@prisma/client'
import { z } from 'zod'

export async function GET(req: Request) {
	try {
		const session = await getAuthSession()

		if (!session?.user) {
			return new Response('Unauthorized', { status: 401 })
		}

		const url = new URL(req.url)
		const { userId, roomId } = roomEventValidator.parse({
			userId: url.searchParams.get('userId'),
			roomId: url.searchParams.get('roomId'),
		})

		const user = (await db.user.findUnique({
			where: {
				id: userId,
			},
		})) as User

		await db.room.update({
			where: {
				roomId: roomId,
			},
			data: {
				queuedUsers: {
					push: user.id,
				},
			},
		})

		return new Response(JSON.stringify({ user }), { status: 201 })
	} catch (error) {
		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		return new Response('Could not fetch user games, please try again later.', { status: 500 })
	}
}

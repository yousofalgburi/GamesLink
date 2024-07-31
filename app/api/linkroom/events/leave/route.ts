import { auth } from '@/auth'
import { db } from '@/prisma/db'
import { roomEventValidator } from '@/lib/validators/linkroom'
import { z } from 'zod'

export async function PATCH(req: Request) {
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

		await db.room.update({
			where: {
				roomId: roomId,
			},
			data: {
				members: {
					disconnect: {
						id: userId,
					},
				},
			},
		})

		return new Response('OK!', { status: 201 })
	} catch (error) {
		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		return new Response('Could not update leave room event, please try again later.', { status: 500 })
	}
}

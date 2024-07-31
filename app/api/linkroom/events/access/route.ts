import { auth } from '@/auth'
import { db } from '@/prisma/db'
import { roomAccessValidator } from '@/lib/validators/linkroom'
import { z } from 'zod'

export async function PATCH(req: Request) {
	try {
		const session = await auth()

		if (!session?.user) {
			return new Response('Unauthorized', { status: 401 })
		}

		const url = new URL(req.url)

		console.log(url.searchParams.get('publicAccess'))

		const { roomId, publicAccess } = roomAccessValidator.parse({
			roomId: url.searchParams.get('roomId'),
			publicAccess: url.searchParams.get('publicAccess') === 'true',
		})

		const roomDetails = await db.room.findUnique({
			where: {
				roomId: roomId,
			},
		})

		if (session.user.id !== roomDetails?.hostId) {
			return new Response('Unauthorized', { status: 401 })
		}

		await db.room.update({
			where: {
				roomId: roomId,
			},
			data: {
				isPublic: publicAccess,
			},
		})

		return new Response('OK!', { status: 201 })
	} catch (error) {
		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		return new Response('Could not update room access, please try again later.', { status: 500 })
	}
}

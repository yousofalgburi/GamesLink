import { auth } from '@/auth'
import { db } from '@/prisma/db'
import { z } from 'zod'

export async function POST(req: Request) {
	try {
		const session = await auth()

		if (!session?.user) {
			return new Response('Unauthorized', { status: 401 })
		}

		const body = await req.json()
		const { id } = z
			.object({
				id: z.string(),
			})
			.parse(body)

		const friendRequest = await db.friendRequest.findFirst({
			where: {
				id: id,
			},
		})

		const user1 = await db.user.findFirst({
			where: {
				id: friendRequest?.fromUserId,
			},
		})

		const user2 = await db.user.findFirst({
			where: {
				id: friendRequest?.toUserId,
			},
		})

		if (!user1 || !user2) {
			return new Response('Could not find users', { status: 500 })
		}

		await db.friendship.create({
			data: {
				userId: user1?.id,
				friendId: user2?.id,
			},
		})

		await db.friendship.create({
			data: {
				userId: user2?.id,
				friendId: user1?.id,
			},
		})

		await db.friendRequest.delete({
			where: {
				id: id,
			},
		})

		return new Response('OK')
	} catch (error) {
		error

		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		return new Response('Could not accept friend request, please try again later.', { status: 500 })
	}
}

import { friendRequestStatus } from '@/constants/enums'
import { auth } from '@/auth'
import { db } from '@/prisma/db'
import { UsernameValidator } from '@/lib/validators/username'
import { z } from 'zod'

export async function POST(req: Request) {
	try {
		const session = await auth()

		if (!session?.user) {
			return new Response('Unauthorized', { status: 401 })
		}

		const body = await req.json()
		const { name } = UsernameValidator.parse(body)

		const username = await db.user.findFirst({
			where: {
				username: name,
			},
		})

		if (!username) {
			return new Response('User does not exist.', { status: 409 })
		}

		const friendRequestExists = await db.friendRequest.findFirst({
			where: {
				toUserId: username.id,
				fromUserId: session.user.id,
			},
		})

		if (friendRequestExists) {
			return new Response('Request already sent.', { status: 410 })
		}

		const alreadyFriends = await db.friendship.findFirst({
			where: {
				userId: session.user.id,
				friendId: username.id,
			},
		})

		if (alreadyFriends) {
			return new Response('Already friends.', { status: 411 })
		}

		if (username.id === session.user.id) {
			return new Response('That is yourself.', { status: 412 })
		}

		await db.friendRequest.create({
			data: {
				toUserId: username.id,
				fromUserId: session.user.id,
				status: friendRequestStatus.PENDING,
			},
		})

		return new Response('OK')
	} catch (error) {
		error

		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		return new Response('Could not send friend request, please try again later.', { status: 500 })
	}
}

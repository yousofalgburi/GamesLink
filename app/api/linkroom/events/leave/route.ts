import { auth } from '@/auth'
import { db } from '@/db'
import { roomEventValidator } from '@/lib/validators/linkroom'
import { z } from 'zod'
import { rooms } from '@/db/schema'
import { eq } from 'drizzle-orm'

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

		const [currentRoom] = await db
			.select({
				allowedUsers: rooms.allowedUsers,
			})
			.from(rooms)
			.where(eq(rooms.roomId, roomId))

		if (!currentRoom) {
			return new Response('Room not found', { status: 404 })
		}

		const allowedUsersArray = currentRoom.allowedUsers
		const updatedAllowedUsersArray = allowedUsersArray?.filter((id) => id !== userId)

		if (allowedUsersArray?.length !== updatedAllowedUsersArray?.length) {
			await db
				.update(rooms)
				.set({
					allowedUsers: updatedAllowedUsersArray,
				})
				.where(eq(rooms.roomId, roomId))

			return new Response('OK!', { status: 201 })
		}

		return new Response('User not found in the room', { status: 404 })
	} catch (error) {
		console.error('Error removing user from room:', error)

		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		return new Response('Could not update leave room event, please try again later.', { status: 500 })
	}
}

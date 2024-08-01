import { auth } from '@/auth'
import { db } from '@/db'
import { z } from 'zod'
import { friendRequests, friendships, users } from '@/db/schema'
import { eq } from 'drizzle-orm'

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

		const [friendRequest] = await db.select().from(friendRequests).where(eq(friendRequests.id, id))

		if (!friendRequest) {
			return new Response('Friend request not found', { status: 404 })
		}

		const [user1] = await db.select().from(users).where(eq(users.id, friendRequest.fromUserId))

		const [user2] = await db.select().from(users).where(eq(users.id, friendRequest.toUserId))

		if (!user1 || !user2) {
			return new Response('Could not find users', { status: 500 })
		}

		await db.insert(friendships).values([
			{
				userId: user1.id,
				friendId: user2.id,
			},
			{
				userId: user2.id,
				friendId: user1.id,
			},
		])

		await db.delete(friendRequests).where(eq(friendRequests.id, id))

		return new Response('OK')
	} catch (error) {
		console.error('Error accepting friend request:', error)

		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		return new Response('Could not accept friend request, please try again later.', { status: 500 })
	}
}

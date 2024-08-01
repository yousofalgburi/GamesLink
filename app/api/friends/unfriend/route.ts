import { auth } from '@/auth'
import { db } from '@/db'
import { z } from 'zod'
import { users, friendships } from '@/db/schema'
import { and, eq, or } from 'drizzle-orm'

export async function POST(req: Request) {
	try {
		const session = await auth()

		if (!session?.user) {
			return new Response('Unauthorized', { status: 401 })
		}

		const body = await req.json()
		const { friendName } = z
			.object({
				friendName: z.string(),
			})
			.parse(body)

		const [friend] = await db.select().from(users).where(eq(users.username, friendName))

		if (!friend) {
			return new Response('Could not find user', { status: 404 })
		}

		const result = await db
			.delete(friendships)
			.where(
				or(
					and(eq(friendships.userId, session.user.id), eq(friendships.friendId, friend.id)),
					and(eq(friendships.userId, friend.id), eq(friendships.friendId, session.user.id)),
				),
			)
			.returning()

		if (result.length === 0) {
			return new Response('Friendship not found', { status: 404 })
		}

		return new Response('OK')
	} catch (error) {
		console.error('Error unfriending user:', error)

		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		return new Response('Could not unfriend user, please try again later.', { status: 500 })
	}
}

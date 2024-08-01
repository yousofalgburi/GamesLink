import { auth } from '@/auth'
import { db } from '@/db'
import { z } from 'zod'
import { friendRequests } from '@/db/schema'
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

		const result = await db.delete(friendRequests).where(eq(friendRequests.id, id)).returning()

		if (result.length === 0) {
			return new Response('Friend request not found', { status: 404 })
		}

		return new Response('OK')
	} catch (error) {
		console.error('Error rejecting friend request:', error)

		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		return new Response('Could not reject friend request, please try again later.', { status: 500 })
	}
}

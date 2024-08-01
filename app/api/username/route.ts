import { auth } from '@/auth'
import { db } from '@/db'
import { UsernameValidator } from '@/lib/validators/username'
import { z } from 'zod'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(req: Request) {
	try {
		const session = await auth()
		if (!session?.user) {
			return new Response('Unauthorized', { status: 401 })
		}

		const body = await req.json()
		const { name } = UsernameValidator.parse(body)

		const [existingUser] = await db.select().from(users).where(eq(users.username, name))

		if (existingUser) {
			return new Response('Username is taken', { status: 409 })
		}

		const result = await db.update(users).set({ username: name }).where(eq(users.id, session.user.id)).returning()

		if (result.length === 0) {
			return new Response('User not found', { status: 404 })
		}

		return new Response('OK')
	} catch (error) {
		console.error('Error updating username:', error)

		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		return new Response('Could not update username at this time. Please try later', { status: 500 })
	}
}

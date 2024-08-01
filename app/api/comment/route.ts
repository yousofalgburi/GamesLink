import { db } from '@/db'
import { CommentValidator } from '@/lib/validators/comment'
import { z } from 'zod'
import words from 'profane-words'
import { auth } from '@/auth'
import { comments } from '@/db/schema'

export async function PATCH(req: Request) {
	try {
		const body = await req.json()

		const { gameId: gameIdString, text, replyToId } = CommentValidator.parse(body)
		const gameId = Number(gameIdString)

		const session = await auth()

		if (!session?.user) {
			return new Response('Unauthorized', { status: 401 })
		}

		if (words.includes(text.toLowerCase())) {
			return new Response('Please keep it nice :)', { status: 403 })
		}

		if (text.length > 256) {
			return new Response('Max length is 256.', { status: 403 })
		}

		await db.insert(comments).values({
			text,
			gameId,
			authorId: session.user.id,
			replyToId: replyToId || null,
		})

		return new Response('OK')
	} catch (error) {
		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		console.error('Error posting comment:', error)
		return new Response('Could not post comment at this time. Please try later', { status: 500 })
	}
}

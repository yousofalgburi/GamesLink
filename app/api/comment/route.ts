import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { CommentValidator } from '@/lib/validators/comment'
import { z } from 'zod'
import words from 'profane-words'

export async function PATCH(req: Request) {
    try {
        const body = await req.json()

        const { gameId: gameIdString, text, replyToId } = CommentValidator.parse(body)
        const gameId = parseInt(gameIdString)

        const session = await getAuthSession()

        if (!session?.user) {
            return new Response('Unauthorized', { status: 401 })
        }

        if (words.includes(text.toLowerCase())) {
            return new Response('Please keep it nice :)', { status: 403 })
        }

        if (text.length > 256) {
            return new Response('Max length is 256.', { status: 403 })
        }

        // if no existing vote, create a new vote
        await db.comment.create({
            data: {
                text,
                gameId,
                authorId: session.user.id,
                replyToId,
            },
        })

        return new Response('OK')
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(error.message, { status: 400 })
        }

        return new Response('Could not post to subreddit at this time. Please try later', { status: 500 })
    }
}

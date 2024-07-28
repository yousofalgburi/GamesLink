import { auth } from '@/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

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

		const friend = await db.user.findFirst({
			where: {
				username: friendName,
			},
		})

		if (!friend) {
			return new Response('Could not find user', { status: 500 })
		}

		await db.friendship.deleteMany({
			where: {
				OR: [
					{
						userId: session.user.id,
						friendId: friend.id,
					},
					{
						userId: friend.id,
						friendId: session.user.id,
					},
				],
			},
		})

		return new Response('OK')
	} catch (error) {
		error

		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		return new Response('Could not unfriend user, please try again later.', { status: 500 })
	}
}

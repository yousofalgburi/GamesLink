import { auth } from '@/auth'
import { db } from '@/prisma/db'
import { LinkRoomValidator } from '@/lib/validators/linkroom/linkroom'
import { z } from 'zod'

export async function POST(req: Request) {
	return new Response(JSON.stringify({ roomId: '' }), { status: 201 })

	// try {
	// 	const session = await auth()

	// 	if (!session?.user) {
	// 		return new Response('Unauthorized', { status: 401 })
	// 	}

	// 	const body = await req.json()
	// 	const { roomId } = LinkRoomValidator.parse(body)

	// 	await db.room.create({
	// 		data: {
	// 			roomId: roomId,
	// 			hostId: session.user.id,
	// 			members: {
	// 				connect: {
	// 					id: session.user.id,
	// 				},
	// 			},
	// 		},
	// 	})

	// 	return new Response(JSON.stringify({ roomId }), { status: 201 })
	// } catch (error) {
	// 	console.log(error)

	// 	if (error instanceof z.ZodError) {
	// 		return new Response(error.message, { status: 400 })
	// 	}

	// 	return new Response('Could not create room, please try again later.', { status: 500 })
	// }
}

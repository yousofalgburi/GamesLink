import { db } from '@/lib/db'
import { roomEventValidator } from '@/lib/validators/linkroom/events'
import { z } from 'zod'

export async function GET(req: Request) {
	try {
		const url = new URL(req.url)
		const { roomId } = roomEventValidator.parse({
			userId: '',
			roomId: url.searchParams.get('roomId'),
		})

		return new Response('OK!', { status: 201 })
	} catch (error) {
		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		return new Response('Could not update leave room event, please try again later.', { status: 500 })
	}
}

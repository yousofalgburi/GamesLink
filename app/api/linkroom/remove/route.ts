import { db } from '@/lib/db'
import { roomEventValidator } from '@/lib/validators/linkroom/events'
import { z } from 'zod'

export async function PATCH(req: Request) {
    try {
        const url = new URL(req.url)
        const { roomId } = roomEventValidator.parse({
            roomId: url.searchParams.get('roomId'),
            userId: '',
        })

        const updatedRooms = await db.room.findUnique({
            where: {
                roomId: roomId,
            },
            include: {
                members: true,
            },
        })

        console.log('attempting to delete room...')

        if (updatedRooms) {
            await db.room.delete({
                where: {
                    roomId: roomId,
                },
            })

            console.log('Room deleted')
        }

        return new Response('OK!', { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(error.message, { status: 400 })
        }

        return new Response('Could not update leave room event, please try again later.', { status: 500 })
    }
}

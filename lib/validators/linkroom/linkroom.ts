import { z } from 'zod'

export const LinkRoomValidator = z.object({
    roomId: z.string().uuid(),
})

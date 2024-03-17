import { z } from 'zod'

export const LinkRoomValidator = z.object({
    roomID: z.string().uuid(),
})

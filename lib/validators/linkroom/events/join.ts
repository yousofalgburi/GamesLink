import { z } from 'zod'

export const JoinRoomValidator = z.object({
    userId: z.string(),
})

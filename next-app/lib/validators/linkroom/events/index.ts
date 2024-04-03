import { z } from 'zod'

export const roomEventValidator = z.object({
    userId: z.string(),
    roomId: z.string(),
})

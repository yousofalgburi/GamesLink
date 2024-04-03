import { z } from 'zod'

export const roomAccessValidator = z.object({
    roomId: z.string(),
    publicAccess: z.boolean(),
})

import { z } from 'zod'

export const LinkRoomValidator = z.object({
	roomId: z.string().uuid(),
})

export const roomEventValidator = z.object({
	userId: z.string(),
	roomId: z.string(),
})

export const roomAccessValidator = z.object({
	roomId: z.string(),
	publicAccess: z.boolean(),
})

import type { users } from '@/db/schema'
import type { ExtendedGame } from './db'
import type { InferSelectModel } from 'drizzle-orm'

export interface UserInRoom extends InferSelectModel<typeof users> {
	games: ExtendedGame[]
}

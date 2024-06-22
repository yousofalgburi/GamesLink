import type { User } from '@prisma/client'
import type { ExtendedGame } from './db'

export interface UserInRoom extends User {
	games: ExtendedGame[]
}

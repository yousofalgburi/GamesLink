import { User } from '@prisma/client'
import { ExtendedGame } from './db'

export interface UserInRoom extends User {
	games: ExtendedGame[]
}

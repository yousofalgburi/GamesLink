import type { SteamGame, Vote, Comment } from '@prisma/client'

export type ExtendedGame = SteamGame & {
    votes: Vote[]
}

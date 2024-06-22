import type { Vote as VoteTable, SteamGame as SteamGameTable } from '@server/src/db/schema'
import type { InferSelectModel } from 'drizzle-orm'

export enum VoteType {
	UP = 'UP',
	DOWN = 'DOWN',
}

export type SteamGame = InferSelectModel<typeof SteamGameTable>
export type Vote = InferSelectModel<typeof VoteTable>

export type ExtendedGame = SteamGame & {
	votes: Vote[]
}

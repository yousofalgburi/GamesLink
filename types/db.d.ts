import type { Vote, Comment, ReleaseDate, GameCategory } from '@prisma/client'

export type GameView = {
	id: number
	steamAppid: number | null
	name: string
	shortDescription: string
	headerImage: string
	requiredAge: number
	isFree: boolean
	releaseDate: ReleaseDate | null
	developers: string
	categories: string[]
	genres: string[]
}

export type ExtendedGame = GameView & {
	votes: Vote[]
}

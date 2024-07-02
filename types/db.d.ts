import type { Vote, Comment } from '@prisma/client'

export type GameView = {
	id: number
	steamAppId: string
	name: string
	shortDescription: string
	headerImage: string
	requiredAge: number
	isFree: boolean
	releaseDate: Date | null
	developers: string[]
	categories: string[]
	genres: string[]
	voteCount: number
}

export type ExtendedGame = GameView & {
	votes: Vote[]
}

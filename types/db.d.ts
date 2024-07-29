export type GameView = {
	id: number
	steamAppid: number | null
	name: string
	shortDescription: string
	headerImage: string
	requiredAge: number
	isFree: boolean
	releaseDate: Date | null
	developers: string[]
	categories: string[]
	genres: string[]
	voteCount
}

export type ExtendedGame = GameView & {
	voteType: VoteType
}

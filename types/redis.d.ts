export type CachedGame = {
	id: string
	steamAppId: string
	name: string
	shortDescription: string
	headerImage: string
	requiredAge: number
	isFree: boolean
	releaseDate?: Date
	developers: string
	categories: string
	genres: string
}

import { db } from '@/lib/db'
import type { ExtendedGame } from '@/types/db'
import { z } from 'zod'

export async function POST(req: Request) {
	function calculateRecommendations(userId: string, userGames: ExtendedGame[], allGames: ExtendedGame[]): ExtendedGame[] {
		// Create a map to store user votes for quick access
		const userVotesMap = new Map<string, 'UP' | 'DOWN'>(
			userGames.flatMap((game) => game.votes.filter((vote) => vote.userId === userId).map((vote) => [game.id.toString(), vote.type])),
		)

		// Create a map to store game profiles for quick access
		const gameProfileMap = new Map<string, Set<string>>(
			allGames.map((game) => [
				game.id.toString(),
				new Set([...game.genres.map((genre) => `genre:${genre}`), ...game.categories.map((category) => `category:${category}`)]),
			]),
		)

		// Calculate scores for each game
		const gameScores = allGames.reduce((scores, game) => {
			if (userVotesMap.has(game.id.toString())) return scores

			const gameProfile = gameProfileMap.get(game.id.toString())
			const score = userGames.reduce((sum, userGame) => {
				const userGameProfile = gameProfileMap.get(userGame.id.toString())
				const similarity = calculateJaccardSimilarity(gameProfile, userGameProfile)
				const vote = userVotesMap.get(userGame.id.toString())
				return sum + (vote === 'UP' ? similarity : -similarity)
			}, 0)

			scores.set(game.id.toString(), score)
			return scores
		}, new Map<string, number>())

		// Sort games based on scores and return the top recommendations
		const sortedGames = [...allGames].sort((a, b) => (gameScores.get(b.id.toString()) || 0) - (gameScores.get(a.id.toString()) || 0))
		const topRecommendations = sortedGames.slice(0, 50)

		return weightedRandomSelection(topRecommendations, gameScores, 10)
	}

	function calculateJaccardSimilarity(set1?: Set<string>, set2?: Set<string>): number {
		if (!set1 || !set2) return 0
		const intersection = new Set([...set1].filter((x) => set2.has(x)))
		const union = new Set([...set1, ...set2])
		return intersection.size / union.size
	}

	function weightedRandomSelection(games: ExtendedGame[], scores: Map<string, number>, count: number): ExtendedGame[] {
		let totalWeight = games.reduce((sum, game) => sum + (scores.get(game.id.toString()) || 0), 0)
		const selectedGames: ExtendedGame[] = []

		for (let i = 0; i < count; i++) {
			const random = Math.random() * totalWeight
			let cumulativeWeight = 0
			let remainingGames = games.slice()

			for (const game of remainingGames) {
				const weight = scores.get(game.id.toString()) || 0
				cumulativeWeight += weight
				if (random <= cumulativeWeight) {
					selectedGames.push(game)
					totalWeight -= weight
					remainingGames = remainingGames.filter((g) => g.id !== game.id)
					break
				}
			}
		}

		return selectedGames
	}

	const body = await req.json()

	try {
		const { userId } = z.object({ userId: z.string() }).parse(body)

		const userGames = (await db.steamGame.findMany({
			where: { votes: { some: { userId } } },
			include: { votes: { where: { userId } } },
		})) as ExtendedGame[]

		const preferredGenres = new Set(userGames.flatMap((game) => game.genres))
		const preferredCategories = new Set(userGames.flatMap((game) => game.categories))

		const allGames = (await db.steamGame.findMany({
			where: {
				genres: { hasSome: [...preferredGenres] },
				categories: { hasSome: [...preferredCategories] },
			},
			include: { votes: true },
		})) as ExtendedGame[]

		const recommendedGames = calculateRecommendations(userId, userGames, allGames)

		return new Response(JSON.stringify({ recommendedGames }))
	} catch (error: unknown) {
		if (error instanceof Error) {
			return new Response(JSON.stringify({ message: 'Error fetching recommended games', error: error.message }), { status: 500 })
		}
		return new Response(JSON.stringify({ message: 'Error fetching recommended games', error: 'Unknown error' }), { status: 500 })
	}
}

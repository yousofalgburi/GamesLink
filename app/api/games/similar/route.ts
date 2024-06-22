import { db } from '@/lib/db'
import { ExtendedGame } from '@/types/db'
import { z } from 'zod'

export async function POST(req: Request) {
	function calculateJaccardSimilarity(set1?: Set<string>, set2?: Set<string>): number {
		if (!set1 || !set2) return 0
		const intersection = new Set([...set1].filter((x) => set2.has(x)))
		const union = new Set([...set1, ...set2])
		return intersection.size / union.size
	}

	const body = await req.json()

	try {
		const { gameId } = z.object({ gameId: z.string() }).parse(body)

		const givenGame = (await db.steamGame.findUnique({
			where: { id: parseInt(gameId) },
			include: { votes: true },
		})) as ExtendedGame | null

		if (!givenGame) {
			return new Response(JSON.stringify({ error: 'Game not found' }), { status: 404 })
		}

		const allGames = (await db.steamGame.findMany({
			where: { id: { not: parseInt(gameId) } },
			include: { votes: true },
		})) as ExtendedGame[]

		const givenGameProfile = new Set([
			...givenGame.genres.map((genre) => `genre:${genre}`),
			...givenGame.categories.map((category) => `category:${category}`),
		])

		const gameScores = allGames.map((game) => {
			const gameProfile = new Set([
				...game.genres.map((genre) => `genre:${genre}`),
				...game.categories.map((category) => `category:${category}`),
			])
			const similarity = calculateJaccardSimilarity(givenGameProfile, gameProfile)
			return { game, similarity }
		})

		const topSimilarGames = gameScores
			.sort((a, b) => b.similarity - a.similarity)
			.slice(0, 10)
			.map((entry) => entry.game)

		return new Response(JSON.stringify({ similarGames: topSimilarGames }))
	} catch (error: any) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 })
	}
}

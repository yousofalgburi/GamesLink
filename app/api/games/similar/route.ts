import { db } from '@/lib/db'
import type { ProcessedGame, GameGenre, GameCategory } from '@prisma/client'
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

		const givenGame = await db.processedGame.findUnique({
			where: { appId: gameId },
			include: { genres: true, categories: true },
		})

		if (!givenGame) {
			return new Response(JSON.stringify({ error: 'Game not found' }), { status: 404 })
		}

		const allGames = await db.processedGame.findMany({
			where: { appId: { not: gameId } },
			include: { genres: true, categories: true },
		})

		const givenGameProfile = new Set([
			...givenGame.genres.map((genre) => `genre:${genre.description}`),
			...givenGame.categories.map((category) => `category:${category.description}`),
		])

		const gameScores = allGames.map((game) => {
			const gameProfile = new Set([
				...game.genres.map((genre) => `genre:${genre.description}`),
				...game.categories.map((category) => `category:${category.description}`),
			])
			const similarity = calculateJaccardSimilarity(givenGameProfile, gameProfile)
			return { game, similarity }
		})

		const topSimilarGames = gameScores
			.sort((a, b) => b.similarity - a.similarity)
			.slice(0, 10)
			.map((entry) => entry.game)

		return new Response(JSON.stringify({ similarGames: topSimilarGames }))
	} catch (error: unknown) {
		if (error instanceof Error) {
			return new Response(JSON.stringify({ error: error.message }), { status: 500 })
		}
		return new Response(JSON.stringify({ error: 'Unknown error' }), { status: 500 })
	}
}

import { z } from 'zod'
import { auth } from '@/auth'
import { getGames } from '@/db/queries/getGames'
import { db } from '@/db'
import { processedGames } from '@/db/schema/game'
import { sql, and, eq } from 'drizzle-orm'
import OpenAI from 'openai'
import { redis } from '@/lib/redis'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

const CACHE_EXPIRATION = 60 * 60 * 24 * 7
const RATE_LIMIT_EXPIRATION = 60 * 60 * 6
const MAX_AI_GENERATIONS = 10

async function getCachedEmbedding(text: string, userId: string): Promise<{ embedding: number[]; isNewGeneration: boolean }> {
	const cacheKey = `embedding:${text}`
	const cachedEmbedding = await redis.get(cacheKey)

	if (cachedEmbedding) {
		return { embedding: JSON.parse(cachedEmbedding), isNewGeneration: false }
	}

	const isWithinRateLimit = await checkRateLimit(userId)
	if (!isWithinRateLimit) {
		throw new Error('Rate limit exceeded')
	}

	const embedding = await generateEmbedding(text)
	await redis.set(cacheKey, JSON.stringify(embedding))
	await redis.expire(cacheKey, CACHE_EXPIRATION)

	return { embedding, isNewGeneration: true }
}

async function generateEmbedding(text: string): Promise<number[]> {
	const response = await openai.embeddings.create({
		model: 'text-embedding-3-large',
		input: text,
		dimensions: 3072,
	})
	return response.data[0].embedding
}

async function checkRateLimit(userId: string): Promise<boolean> {
	const rateLimitKey = `ai_rate_limit:${userId}`
	const currentCount = await redis.incr(rateLimitKey)

	if (currentCount === 1) {
		await redis.expire(rateLimitKey, RATE_LIMIT_EXPIRATION)
	}

	return currentCount <= MAX_AI_GENERATIONS
}

async function findSimilarGames(embedding: number[]) {
	const gamesWithEmbeddings = await db
		.select({
			id: processedGames.id,
			steamAppid: processedGames.steamAppid,
			name: processedGames.name,
			shortDescription: processedGames.shortDescription,
			headerImage: processedGames.headerImage,
			requiredAge: processedGames.requiredAge,
			isFree: processedGames.isFree,
			releaseDate: processedGames.releaseDate,
			developers: processedGames.developers,
			genres: processedGames.genres,
			categories: processedGames.categories,
			voteCount: processedGames.voteCount,
			embedding: processedGames.embedding,
		})
		.from(processedGames)
		.where(and(sql`${processedGames.embedding} IS NOT NULL`, eq(processedGames.type, 'game'), sql`${processedGames.nsfw} = false`))
		.limit(1000)

	const gamesWithSimilarity = gamesWithEmbeddings.map((game) => ({
		...game,
		similarity: cosineSimilarity(embedding, game.embedding as number[]),
	}))

	return gamesWithSimilarity.sort((a, b) => b.similarity - a.similarity).slice(0, 20)
}

function cosineSimilarity(a: number[], b: number[]): number {
	const dotProduct = a.reduce((sum, _, i) => sum + a[i] * b[i], 0)
	const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
	const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
	return dotProduct / (magnitudeA * magnitudeB)
}

export async function GET(req: Request) {
	const url = new URL(req.url)
	const session = await auth()

	try {
		const searchParams = z
			.object({
				page: z.coerce.number().int().positive().default(1),
				search: z.string().default(''),
				searchOption: z.string().default('smart-text'),
				genres: z.string().default(''),
				categories: z.string().default(''),
				sort: z.string().default('popularity-desc'),
			})
			.parse(Object.fromEntries(url.searchParams))

		if (searchParams.searchOption === 'ai-search') {
			if (!session?.user) {
				return new Response(JSON.stringify({ error: 'Unauthorized' }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' },
				})
			}
			if (searchParams.search) {
				try {
					const { embedding, isNewGeneration } = await getCachedEmbedding(searchParams.search, session.user.id)
					const similarGames = await findSimilarGames(embedding)
					return new Response(JSON.stringify({ games: similarGames, totalGames: similarGames.length, isNewGeneration }), {
						headers: { 'Content-Type': 'application/json' },
					})
				} catch (error) {
					if (error instanceof Error && error.message === 'Rate limit exceeded') {
						return new Response(JSON.stringify({ error: 'Rate limit exceeded', rateLimitExceeded: true }), {
							status: 429,
							headers: { 'Content-Type': 'application/json' },
						})
					}
					throw error
				}
			}
		}

		const { games, totalGames } = await getGames(searchParams, session)

		return new Response(JSON.stringify({ games, totalGames }), {
			headers: { 'Content-Type': 'application/json' },
		})
	} catch (error) {
		console.error(error)
		return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		})
	}
}

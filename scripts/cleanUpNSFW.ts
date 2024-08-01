import { sql } from 'drizzle-orm'
import { processedGames } from '@/db/schema'
import { db } from '@/db'

export async function POST(req: Request) {
	const nsfwWords = process.env.CLEAN_UP_NSFW_WORDS?.split(',') || []

	const nsfwConditions = nsfwWords.map(
		(word) => sql`${processedGames.name} ILIKE ${`%${word}%`} OR ${processedGames.shortDescription} ILIKE ${`%${word}%`}`,
	)

	const updateResult = await db
		.update(processedGames)
		.set({ nsfw: true })
		.where(sql`(${sql.join(nsfwConditions, sql` OR `)}) AND ${processedGames.nsfw} = false`)
		.returning()

	console.log(`Updated ${updateResult.length} games to NSFW`)

	return Response.json({ message: 'NSFW games updated' })
}

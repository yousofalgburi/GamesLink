import { z } from 'zod'
import { auth } from '@/auth'
import { getGames } from '@/lib/db/queries/getGames'

export async function GET(req: Request) {
	const url = new URL(req.url)
	const session = await auth()

	try {
		const searchParams = z
			.object({
				page: z.coerce.number().int().positive().default(1),
				search: z.string().default(''),
				searchOption: z.string().default(''),
				genres: z.string().default(''),
				categories: z.string().default(''),
				sort: z.string().default('popularity-desc'),
			})
			.parse(Object.fromEntries(url.searchParams))

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

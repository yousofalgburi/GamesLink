import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: Request) {
	try {
		const arrayOfWords = ['sex', 'Sex', 'NSFW', 'nsfw', 'porn', 'Porn', 'hentai', 'Hentai', 'nudity', 'Nudity', 'Nude', 'nude']

		await db.steamGame.deleteMany({
			where: {
				OR: [
					{
						categories: {
							has: 'Sex',
						},
					},
					{
						genres: {
							has: 'Sex',
						},
					},
					{
						shortDescription: {
							contains: 'Nude',
						},
					},
					{
						name: {
							contains: 'Nude',
						},
					},
				],
			},
		})

		return new Response(JSON.stringify({ message: 'Clean up finished successfully' }))
	} catch (error: any) {
		console.error(error)
		return new Response(JSON.stringify({ message: 'Error importing data', error: error.message }), { status: 500 })
	}
}

import Link from 'next/link'
import { db } from '@/db'
import { processedGames } from '@/db/schema'
import { and, eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'
export const revalidate = 86400 // Revalidate every 24 hours

async function getGames() {
	return db
		.select({ steamAppid: processedGames.steamAppid, name: processedGames.name })
		.from(processedGames)
		.where(and(eq(processedGames.nsfw, false), eq(processedGames.type, 'game')))
		.orderBy(processedGames.name)
}

export default async function CatalogPage() {
	const games = await getGames()

	return (
		<div className='container mx-auto py-8'>
			<h1 className='text-3xl font-bold mb-6'>Game Catalog</h1>
			<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
				{games.map((game) => (
					<Link
						key={game.steamAppid}
						href={`/game/${game.steamAppid}`}
						className='p-4 border border-border rounded-lg hover:bg-secondary transition-colors'
					>
						<h2 className='text-lg font-semibold'>{game.name}</h2>
					</Link>
				))}
			</div>
		</div>
	)
}

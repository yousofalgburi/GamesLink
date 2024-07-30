import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { ExtendedGame } from '@/types/db'
import { BadgeInfo } from 'lucide-react'
import HiddenAuth from './HiddenAuth'
import { auth } from '@/auth'
import GameCarousel from './GameCarousel'
import { db } from '@/db'
import { eq, sql } from 'drizzle-orm'
import { processedGames } from '@/db/schema'

export default async function SimilarGames({ gameId }: { gameId: string }) {
	const session = await auth()

	const givenGame = await db
		.select({
			genres: processedGames.genres,
			categories: processedGames.categories,
		})
		.from(processedGames)
		.where(eq(processedGames.steamAppid, Number(gameId)))
		.limit(1)

	if (!givenGame[0]) {
		return new Response(JSON.stringify({ error: 'Game not found' }), { status: 404 })
	}

	const givenGameGenres = givenGame[0].genres || []
	const givenGameCategories = givenGame[0].categories || []

	const similarGames = await db.execute(
		sql`
            SELECT 
                id,
                steam_appid AS "steamAppid",
                name,
                short_description AS "shortDescription",
                header_image AS "headerImage",
                required_age AS "requiredAge",
                is_free AS "isFree",
                release_date AS "releaseDate",
                developers,
                categories,
                genres,
                vote_count AS "voteCount",
                (
                SELECT COUNT(*) 
                FROM unnest(genres) AS genre
                WHERE genre = ANY(${sql.join([
					sql`ARRAY[${sql.join(
						givenGameGenres.map((genre) => sql`${genre}`),
						sql`,`,
					)}]`,
				])})
                ) +
                (
                SELECT COUNT(*)
                FROM unnest(categories) AS category  
                WHERE category = ANY(${sql.join([
					sql`ARRAY[${sql.join(
						givenGameCategories.map((category) => sql`${category}`),
						sql`,`,
					)}]`,
				])})
                ) AS score
            FROM processed_games
            WHERE steam_appid != ${gameId}
            ORDER BY score DESC
            LIMIT 10
        `,
	)

	const games = similarGames.map((game) => ({
		id: game.id as number,
		steamAppid: game.steamAppid as number | null,
		name: game.name as string,
		shortDescription: game.shortDescription as string,
		headerImage: game.headerImage as string,
		requiredAge: game.requiredAge as number,
		isFree: game.isFree as boolean,
		releaseDate: game.releaseDate as Date | null,
		developers: game.developers as string[],
		categories: game.categories as string[],
		genres: game.genres as string[],
		voteCount: game.voteCount as number,
	})) as ExtendedGame[]

	return (
		<>
			<div className='flex items-center justify-between pb-4'>
				<div className='flex items-center gap-3'>
					<h1 className='text-3xl font-bold'>Similar Games</h1>

					{session?.user && (
						<Dialog>
							<DialogTrigger asChild>
								<BadgeInfo className='cursor-pointer' />
							</DialogTrigger>
							<DialogContent className='sm:max-w-[425px]'>
								<DialogHeader>
									<DialogTitle>Similar Games</DialogTitle>
								</DialogHeader>

								<p>
									These games are recommended based on their similarity to the selected game. The similarity is calculated based on
									genres and categories.
								</p>
							</DialogContent>
						</Dialog>
					)}
				</div>
			</div>

			{session?.user ? <GameCarousel games={games} /> : <HiddenAuth message='to see similar games.' />}
		</>
	)
}

import type { ExtendedGame } from '@/types/db'
import { sql } from 'drizzle-orm'
import { db } from '..'

export async function getRecommendedGames(userId: string): Promise<ExtendedGame[]> {
	try {
		const userLikedGames = await db.execute(sql`
            SELECT g.genres, g.categories
            FROM game_votes v
            JOIN processed_games g ON v.game_id = g.id
            WHERE v.user_id = ${userId} AND v.vote_type = 'UP'
        `)

		const preferredGenres = new Set(userLikedGames.flatMap((game) => game.genres))
		const preferredCategories = new Set(userLikedGames.flatMap((game) => game.categories))

		const potentialRecommendations = await db.execute(sql`
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
                    WHERE genre = ANY(${
						preferredGenres.size > 0
							? sql`ARRAY[${sql.join(
									Array.from(preferredGenres).map((genre) => sql`${genre}`),
									sql`,`,
								)}]::text[]`
							: sql`ARRAY[]::text[]`
					})
                ) +
                (
                    SELECT COUNT(*)
                    FROM unnest(categories) AS category  
                    WHERE category = ANY(${
						preferredCategories.size > 0
							? sql`ARRAY[${sql.join(
									Array.from(preferredCategories).map((category) => sql`${category}`),
									sql`,`,
								)}]::text[]`
							: sql`ARRAY[]::text[]`
					})
                ) AS similarity_score
            FROM processed_games
            WHERE id NOT IN (
                SELECT game_id 
                FROM game_votes 
                WHERE user_id = ${userId}
            )
            ORDER BY similarity_score DESC
            LIMIT 50
        `)

		const shuffled = potentialRecommendations.sort(() => 0.5 - Math.random())
		const selectedRecommendations = shuffled.slice(0, 10)

		return selectedRecommendations.map((game) => ({
			id: game.id,
			steamAppid: game.steamAppid,
			name: game.name,
			shortDescription: game.shortDescription,
			headerImage: game.headerImage,
			requiredAge: game.requiredAge,
			isFree: game.isFree,
			releaseDate: game.releaseDate,
			developers: game.developers,
			categories: game.categories,
			genres: game.genres,
			voteCount: game.voteCount,
		})) as ExtendedGame[]
	} catch (error) {
		console.error(error)
		return []
	}
}

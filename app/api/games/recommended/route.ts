import { db } from '@/lib/db'
import { ExtendedGame } from '@/types/db'
import { z } from 'zod'

export async function POST(req: Request) {
    function calculateRecommendations(
        userId: string,
        userGames: ExtendedGame[],
        allGames: ExtendedGame[]
    ): ExtendedGame[] {
        // Create a map to store genre and category information for quick access
        let gameProfileMap = new Map<string, Set<string>>()

        allGames.forEach((game) => {
            let profile = new Set<string>()
            game.genres.forEach((genre) => profile.add('genre:' + genre))
            game.categories.forEach((category) => profile.add('category:' + category))
            gameProfileMap.set(game.id.toString(), profile)
        })

        // Function to calculate similarity between two games
        function calculateSimilarity(game1: ExtendedGame, game2: ExtendedGame): number {
            let profile1 = gameProfileMap.get(game1.id.toString())
            let profile2 = gameProfileMap.get(game2.id.toString())

            // Check if both profiles are defined
            if (!profile1 || !profile2) return 0

            let common = new Set([...profile1].filter((x) => profile2 && profile2.has(x)))
            return common.size / Math.sqrt(profile1.size * profile2.size) // Cosine similarity
        }

        // Predict user preferences for each game
        let gameScores = new Map<string, number>()
        allGames.forEach((game) => {
            if (userGames.find((ug) => ug.id === game.id)) return // Skip games the user has already voted on

            let score = 0
            userGames.forEach((userGame) => {
                let similarity = calculateSimilarity(game, userGame)
                let vote = userGame.votes.find((vote) => vote.userId === userId)?.type
                score += (vote === 'UP' ? 1 : -1) * similarity
            })

            gameScores.set(game.id.toString(), score)
        })

        function weightedRandomSelection(
            games: ExtendedGame[],
            scores: Map<string, number>,
            count: number
        ): ExtendedGame[] {
            let weightedGames: { game: ExtendedGame; weight: number }[] = games.map((game) => ({
                game: game,
                weight: scores.get(game.id.toString()) || 0,
            }))

            // Normalize weights
            let totalWeight = weightedGames.reduce((total, { weight }) => total + weight, 0)

            let selectedGames: ExtendedGame[] = []
            for (let i = 0; i < count; i++) {
                let random = Math.random()
                let cumulativeWeight = 0

                for (const { game, weight } of weightedGames) {
                    cumulativeWeight += weight / totalWeight
                    if (random <= cumulativeWeight) {
                        selectedGames.push(game)

                        // remove the selected game from the weightedGames array
                        weightedGames = weightedGames.filter((wg) => wg.game.id !== game.id)

                        // recalculate totalWeight after removing the selected game
                        totalWeight = weightedGames.reduce((total, { weight }) => total + weight, 0)

                        break
                    }
                }
            }

            return selectedGames
        }

        // Sort games based on scores and return the top recommendations
        let sortedGames = Array.from(allGames).sort(
            (a, b) => (gameScores.get(b.id.toString()) || 0) - (gameScores.get(a.id.toString()) || 0)
        )

        // Randomly select a subset of the top recommendations
        const recommendedGames = weightedRandomSelection(sortedGames.slice(0, 50), gameScores, 10)

        return recommendedGames
    }

    const requestBody = await new Response(req.body).json()

    try {
        const { userId } = z
            .object({
                userId: z.string(),
            })
            .parse(requestBody)

        const userGames = (await db.steamGame.findMany({
            where: {
                votes: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                votes: {
                    where: {
                        userId,
                    },
                },
            },
        })) as ExtendedGame[]

        let preferredGenres = new Set<string>()
        userGames.forEach((vote) => {
            vote.genres.forEach((genre) => preferredGenres.add(genre))
        })

        let preferredCategories = new Set<string>()
        userGames.forEach((vote) => {
            vote.categories.forEach((category) => preferredCategories.add(category))
        })

        // Fetch all games with genres and categories
        const allGames = (await db.steamGame.findMany({
            where: {
                genres: {
                    hasSome: Array.from(preferredGenres),
                },
                categories: {
                    hasSome: Array.from(preferredCategories),
                },
            },
            include: {
                votes: true,
            },
        })) as ExtendedGame[]

        // Calculate recommendations
        const recommendedGames = await calculateRecommendations(userId, userGames, allGames)

        // Return both games and the total count
        return new Response(JSON.stringify({ recommendedGames }))
    } catch (error: any) {
        return new Response(error, { status: 500 })
    }
}

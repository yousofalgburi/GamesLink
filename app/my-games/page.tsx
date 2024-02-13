import GameCard from '@/components/GameCard'
import RecommendedGames from '@/components/RecommendedGames'
import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { ExtendedGame } from '@/types/db'

export default async function Page() {
    const session = await getAuthSession()
    let games: ExtendedGame[] = []

    // Check user logged in
    if (session?.user) {
        games = (await db.steamGame.findMany({
            where: {
                votes: {
                    some: {
                        userId: session.user.id,
                    },
                },
            },
            include: {
                votes: {
                    where: {
                        userId: session.user.id,
                    },
                },
            },
            orderBy: {
                voteCount: 'desc',
            },
        })) as ExtendedGame[]
    } else {
        games = []
    }

    return (
        <div className="mx-auto flex min-h-[90vh] flex-col gap-10 px-16 py-6">
            <div>
                <RecommendedGames />
            </div>

            <div>
                <h1 className="pb-4 text-3xl font-bold">Games ({games.length})</h1>
                <div className="flex max-h-[50rem] flex-wrap gap-4 overflow-y-scroll pr-2 xl:max-h-[80rem]">
                    {games &&
                        games.map((game, index) => {
                            const votesAmt = game.votes.reduce((acc, vote) => {
                                if (vote.type === 'UP') return acc + 1
                                if (vote.type === 'DOWN') return acc - 1
                                return acc
                            }, 0)

                            const currentVote = game.votes.find((vote) => vote.userId === session?.user.id)

                            return <GameCard key={index} votesAmt={votesAmt} currentVote={currentVote} game={game} />
                        })}
                </div>
            </div>
        </div>
    )
}

import CommentsSection from '@/components/CommentsSection'
import PostVoteServer from '@/components/post-vote/PostVoteServer'
import PostVoteShell from '@/components/post-vote/PostVoteShell'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { db } from '@/lib/db'
import { redis } from '@/lib/redis'
import { cn } from '@/lib/utils'
import { CachedGame } from '@/types/redis'
import { SteamGame } from '@prisma/client'
import { CalendarHeartIcon, ChevronLeft, DollarSignIcon, ExternalLinkIcon, ShieldIcon, UserIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

interface PageProps {
    params: {
        id: string
    }
}

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function Page({ params: { id } }: PageProps) {
    const cachedGame = (await redis.hgetall(`game:${id}`)) as CachedGame

    let game: SteamGame | null = null

    if (!cachedGame) {
        game = await db.steamGame.findFirst({
            where: {
                id: Number(id),
            },
        })
    }

    if (!game && !cachedGame) return notFound()

    return (
        <div className="container mx-auto flex min-h-[90vh] flex-col justify-around gap-8 px-4 py-12 lg:flex-row">
            <Link href="/home" className={cn(buttonVariants({ variant: 'ghost' }), '-mt-10 self-start')}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Home
            </Link>

            <div className="w-full max-w-[600px]">
                <div className="grid gap-6">
                    <div className="overflow-hidden rounded-lg">
                        <Image
                            alt="Game banner"
                            className="object-fit h-64 w-full"
                            height="400"
                            src={game?.headerImage ?? cachedGame.headerImage}
                            width="400"
                        />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold">{game?.name ?? cachedGame.name}</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {game?.shortDescription ?? cachedGame.shortDescription}
                        </p>
                    </div>
                    <div className="gap-2">
                        <h2 className="text-xl font-bold">Genres</h2>
                        {cachedGame && (
                            <div className="flex flex-wrap gap-1 pt-3">
                                {cachedGame?.genres
                                    .split(',')
                                    .map((genre, index) => <Badge key={index}>{genre}</Badge>)}
                            </div>
                        )}

                        {game?.genres.length && (
                            <div className="flex flex-wrap gap-1 pt-3">
                                {game?.genres.map((genre, index) => <Badge key={index}>{genre}</Badge>)}
                            </div>
                        )}
                    </div>
                    <div className="gap-2">
                        <h2 className="text-xl font-bold">Categories</h2>

                        {cachedGame && (
                            <div className="flex flex-wrap gap-1 pt-3">
                                {cachedGame?.categories
                                    .split(',')
                                    .map((category, index) => <Badge key={index}>{category}</Badge>)}
                            </div>
                        )}

                        {game?.genres.length && (
                            <div className="flex flex-wrap gap-1 pt-3">
                                {game?.categories.map((category, index) => <Badge key={index}>{category}</Badge>)}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <CalendarHeartIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <span>
                                Released on{' '}
                                {cachedGame
                                    ? cachedGame.releaseDate
                                        ? new Date(cachedGame.releaseDate).toLocaleDateString()
                                        : 'Unknown'
                                    : game?.releaseDate
                                      ? game?.releaseDate.toLocaleDateString()
                                      : 'Unknown'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <span>Rated {game?.requiredAge ?? cachedGame.requiredAge}+</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <DollarSignIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <span>{game?.isFree ?? cachedGame.isFree ? 'Free to Play' : 'Paid'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <span>
                                Developer
                                {game?.developers.length ?? cachedGame.developers.split(',').length > 1
                                    ? 's'
                                    : ''}:{' '}
                                {cachedGame &&
                                    cachedGame.developers.split(',').map((developer, index) => (
                                        <span key={index}>
                                            {developer}
                                            {index === cachedGame.developers.split(',').length - 1 ? '' : ', '}
                                        </span>
                                    ))}
                                {game?.developers.map((developer, index) => (
                                    <span key={index}>
                                        {developer}
                                        {index === game?.developers.length || 0 - 1 ? '' : ', '}
                                    </span>
                                ))}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <Link
                            className="inline-flex items-center rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800"
                            href={`https://store.steampowered.com/app/${game?.steamAppId ?? cachedGame.steamAppId}`}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <ExternalLinkIcon className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                            View on Steam
                        </Link>
                        <Suspense fallback={<PostVoteShell />}>
                            <PostVoteServer
                                postId={id}
                                getData={async () => {
                                    const game = await db.steamGame.findFirst({
                                        where: {
                                            id: Number(id),
                                        },
                                        include: {
                                            votes: true,
                                        },
                                    })

                                    return game
                                }}
                            />
                        </Suspense>
                    </div>
                </div>
            </div>
            <div className="w-full max-w-[600px]">
                <Card className="p-2">
                    <CardHeader>
                        <h2 className="text-2xl font-bold">Community Chat</h2>
                    </CardHeader>
                    <CardContent>
                        {/* @ts-expect-error Server Component */}
                        <CommentsSection orderBy="voteCount" gameId={game?.id.toString() ?? cachedGame.id} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

import CommentsSection from '@/components/CommentsSection'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { db } from '@/lib/db/index'
import { cn } from '@/lib/utils'
import type { CachedGame } from '@/types/redis'
import { CalendarHeartIcon, ChevronLeft, DollarSignIcon, ExternalLinkIcon, ShieldIcon, UserIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache, Suspense } from 'react'
import SimilarGames from '@/components/SimilarGames'
import { processedGames } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getRedisClient } from '@/lib/redis'

interface PageProps {
	params: {
		id: string
	}
}

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function Page({ params: { id } }: PageProps) {
	const redis = await getRedisClient()
	const cachedGame = JSON.parse((await redis.get(`game:${id}`)) ?? '') as CachedGame

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let game: any | null = null

	console.log(cachedGame)

	if (!cachedGame) {
		const [dbGame] = await db
			.select()
			.from(processedGames)
			.where(eq(processedGames.steamAppid, Number(id)))

		game = dbGame
	}

	console.log(game)

	if (!game && !cachedGame) return notFound()

	return (
		<div className='container mx-auto flex min-h-[90vh] flex-col gap-8 px-4 py-12'>
			<Link href='/home' className={cn(buttonVariants({ variant: 'ghost' }), '-mt-10 self-start')}>
				<ChevronLeft className='mr-2 h-4 w-4' />
				Home
			</Link>

			<div className='flex flex-col gap-8 lg:flex-row'>
				<div className='w-full max-w-[600px]'>
					<div className='grid gap-6'>
						<div className='overflow-hidden rounded-lg'>
							<Image
								alt='Game banner'
								className='object-fit h-64 w-full'
								height='400'
								src={game?.headerImage ?? cachedGame.headerImage}
								width='400'
							/>
						</div>
						<div className='space-y-2'>
							<h1 className='text-4xl font-bold'>{game?.name ?? cachedGame.name}</h1>
							<p className='text-gray-500 dark:text-gray-400'>{game?.shortDescription ?? cachedGame.shortDescription}</p>
						</div>
						<div className='gap-2'>
							<h2 className='text-xl font-bold'>Genres</h2>
							{cachedGame && (
								<div className='flex flex-wrap gap-1 pt-3'>
									{cachedGame?.genres.split(',').map((genre) => (
										<Badge key={genre}>{genre}</Badge>
									))}
								</div>
							)}

							{game?.genres.length && (
								<div className='flex flex-wrap gap-1 pt-3'>
									{game?.genres.map((genre) => (
										<Badge key={genre}>{genre}</Badge>
									))}
								</div>
							)}
						</div>
						<div className='gap-2'>
							<h2 className='text-xl font-bold'>Categories</h2>

							{cachedGame && (
								<div className='flex flex-wrap gap-1 pt-3'>
									{cachedGame?.categories.split(',').map((category) => (
										<Badge key={category}>{category}</Badge>
									))}
								</div>
							)}

							{game?.categories.length && (
								<div className='flex flex-wrap gap-1 pt-3'>
									{game?.categories.map((category) => (
										<Badge key={category}>{category}</Badge>
									))}
								</div>
							)}
						</div>
						<div className='flex items-center gap-4'>
							<div className='flex items-center gap-2'>
								<CalendarHeartIcon className='h-5 w-5 text-gray-500 dark:text-gray-400' />
								<span>
									Released on{' '}
									{cachedGame
										? cachedGame.releaseDate
											? new Date(cachedGame.releaseDate).toLocaleDateString()
											: 'Unknown'
										: game?.releaseDate
											? game?.releaseDate.date
											: 'Unknown'}
								</span>
							</div>
							<div className='flex items-center gap-2'>
								<ShieldIcon className='h-5 w-5 text-gray-500 dark:text-gray-400' />
								<span>Rated {game?.requiredAge ?? cachedGame.requiredAge}+</span>
							</div>
							<div className='flex items-center gap-2'>
								<DollarSignIcon className='h-5 w-5 text-gray-500 dark:text-gray-400' />
								<span>{game?.isFree ?? cachedGame.isFree ? 'Free to Play' : 'Paid'}</span>
							</div>
						</div>
						<div className='flex items-center gap-4'>
							<div className='flex items-center gap-2'>
								<UserIcon className='h-5 w-5 text-gray-500 dark:text-gray-400' />
								<span>
									Developer
									{cachedGame?.developers ?? (game?.developers?.length && game?.developers?.length > 1) ? 's' : ''}:{' '}
									{cachedGame?.developers ??
										game?.developers.map((developer, index, array) => (
											<span key={developer}>
												{developer}
												{index === array.length - 1 ? '' : ', '}
											</span>
										))}
								</span>
							</div>
						</div>
						<div className='flex items-center justify-between'>
							<Link
								className='inline-flex items-center rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800'
								href={`https://store.steampowered.com/app/${game?.steamAppid ?? cachedGame.steamAppId}`}
								rel='noopener noreferrer'
								target='_blank'
							>
								<ExternalLinkIcon className='mr-2 h-5 w-5 text-gray-500 dark:text-gray-400' />
								View on Steam
							</Link>
							{/* <Suspense fallback={<GameVoteShell />}>
								<GameVoteServer
									gameId={id}
									getData={async () => {
										const game = await db.processedGame.findFirst({
											where: {
												id: Number(id),
											},
										})

										const gameInteraction = await db.gameInteraction.findUnique({
											where: {
												appId: game?.appId ?? '',
											},
										})

										return { game, gameInteraction }
									}}
								/>
							</Suspense> */}
						</div>
					</div>
				</div>
				<div className='w-full max-w-[600px]'>
					<Card className='p-2'>
						<CardHeader>
							<h2 className='text-2xl font-bold'>Community Chat</h2>
						</CardHeader>
						<CardContent>
							{/* @ts-expect-error Server Component */}
							<CommentsSection orderBy='voteCount' gameId={game?.id.toString() ?? cachedGame.id} />
						</CardContent>
					</Card>
				</div>
			</div>

			<div className='mt-8 w-full'>
				<Suspense fallback={<div>Loading similar games...</div>}>
					<SimilarGames gameId={id} />
				</Suspense>
			</div>
		</div>
	)
}

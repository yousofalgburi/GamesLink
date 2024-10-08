import CommentsSection from '@/components/comments/CommentsSection'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { db } from '@/db'
import { cn } from '@/lib/utils'
import type { CachedGame } from '@/types/redis'
import { CalendarHeartIcon, ChevronLeft, DollarSignIcon, ExternalLinkIcon, ShieldIcon, UserIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import SimilarGames from '@/components/SimilarGames'
import { processedGames } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { GameView } from '@/types/db'
import GameVoteShell from '@/components/game-vote/GameVoteShell'
import GameVoteServer from '@/components/game-vote/GameVoteServer'
import { redis } from '@/lib/redis'
import type { Metadata } from 'next'

interface PageProps {
	params: {
		id: string
	}
}

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function generateMetadata({ params: { id } }: PageProps): Promise<Metadata> {
	try {
		const [game] = await db
			.select()
			.from(processedGames)
			.where(eq(processedGames.steamAppid, Number(id)))

		if (!game) {
			return {
				title: 'Game not found',
				description: 'The game you are looking for does not exist.',
			}
		}

		return {
			title: game.name,
			description: game.shortDescription,
			openGraph: {
				title: game.name,
				description: game.shortDescription ?? '',
				images: [game.headerImage ?? ''],
			},
		}
	} catch (error) {
		console.error('Error generating metadata:', error)
		return {
			title: 'Error',
			description: 'There was an error fetching the game metadata.',
		}
	}
}

export default async function Page({ params: { id } }: PageProps) {
	let cachedGame: CachedGame | null = null
	let game: GameView | null = null

	try {
		const rawCachedGame = await redis.get(`game:${id}`)
		cachedGame = rawCachedGame ? JSON.parse(rawCachedGame) : null
	} catch (error) {
		console.error('Error fetching cached game:', error)
	}

	if (!cachedGame) {
		const [dbGame] = await db
			.select()
			.from(processedGames)
			.where(eq(processedGames.steamAppid, Number(id)))

		game = dbGame as GameView
	}

	if (!game && !cachedGame) return notFound()

	const displayGame = cachedGame || game

	return (
		<div className='container mx-auto flex min-h-[90vh] flex-col gap-8 px-4 py-12'>
			<Link href='/home' className={cn(buttonVariants({ variant: 'ghost' }), '-mt-10 self-start')}>
				<ChevronLeft className='mr-2 h-4 w-4' />
				Home
			</Link>

			<div className='flex flex-col gap-8 lg:flex-row'>
				<div className='w-full max-w-[575px]'>
					<div className='grid gap-6'>
						<div className='overflow-hidden rounded-lg'>
							<Image
								alt='Game banner'
								className='object-fit h-64 w-full'
								height='400'
								src={cachedGame?.headerImage ?? game?.headerImage ?? ''}
								width='400'
							/>
						</div>
						<div className='space-y-2'>
							<h1 className='text-4xl font-bold'>{cachedGame?.name ?? game?.name}</h1>
							<p className='text-gray-500 dark:text-gray-4000'>{cachedGame?.shortDescription ?? game?.shortDescription}</p>
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
								<span>Released on {cachedGame?.releaseDate?.toLocaleString() ?? game?.releaseDate?.toLocaleString()}</span>
							</div>
							<div className='flex items-center gap-2'>
								<ShieldIcon className='h-5 w-5 text-gray-500 dark:text-gray-400' />
								<span>Rated {cachedGame?.requiredAge ?? game?.requiredAge}+</span>
							</div>
							<div className='flex items-center gap-2'>
								<DollarSignIcon className='h-5 w-5 text-gray-500 dark:text-gray-400' />
								<span>{cachedGame?.isFree ?? game?.isFree ? 'Free to Play' : 'Paid'}</span>
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
								href={`https://store.steampowered.com/app/${cachedGame?.steamAppId ?? game?.steamAppid}`}
								rel='noopener noreferrer'
								target='_blank'
							>
								<ExternalLinkIcon className='mr-2 h-5 w-5 text-gray-500 dark:text-gray-400' />
								View on Steam
							</Link>
							<Suspense fallback={<GameVoteShell />}>
								<GameVoteServer gameId={id} />
							</Suspense>
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
					{/* @ts-expect-error Server Component */}
					<SimilarGames gameId={id} />
				</Suspense>
			</div>
		</div>
	)
}

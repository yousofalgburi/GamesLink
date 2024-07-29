'use client'

import GameCard from '@/components/GameCard'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import type { ExtendedGame } from '@/types/db'
import { useIntersection } from '@mantine/hooks'
import { useInfiniteQuery } from '@tanstack/react-query'
import axios, { type CancelToken } from 'axios'
import { ArrowDownUp, ArrowUpDown, Brain, Search, Sparkles } from 'lucide-react'
import type { Session } from 'next-auth'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

interface GameFeedProps {
	initGames: ExtendedGame[]
	initTotalGames: number
	searchParamsObj: {
		page: number
		search: string
		searchOption: string
		genres: string
		categories: string
		sort: string
	}
	session: Session | null
}

const GenreFilters = [
	{ label: 'Accounting', checked: false },
	{ label: 'Action', checked: false },
	{ label: 'Adventure', checked: false },
	{ label: 'Aktion', checked: false },
	{ label: 'Audio Production', checked: false },
	{ label: 'Casual', checked: false },
	{ label: 'Early Access', checked: false },
	{ label: 'Education', checked: false },
	{ label: 'Free to Play', checked: false },
	{ label: 'Game Development', checked: false },
	{ label: 'Gore', checked: false },
	{ label: 'Indie', checked: false },
	{ label: 'Photo Editing', checked: false },
	{ label: 'Racing', checked: false },
	{ label: 'RPG', checked: false },
	{ label: 'Simulation', checked: false },
	{ label: 'Software Training', checked: false },
	{ label: 'Sports', checked: false },
	{ label: 'Strategy', checked: false },
	{ label: 'Utilities', checked: false },
	{ label: 'Video Production', checked: false },
	{ label: 'Violent', checked: false },
	{ label: 'Web Publishing', checked: false },
]

const CategoryFilters = [
	{ label: 'Captions available', checked: false },
	{ label: 'Steam Cloud', checked: false },
	{ label: 'Includes level editor', checked: false },
	{ label: 'Steam Workshop', checked: false },
	{ label: 'Stats', checked: false },
	{ label: 'Remote Play Together', checked: false },
	{ label: 'Co-op', checked: false },
	{ label: 'Steam Achievements', checked: false },
	{ label: 'Full controller support', checked: false },
	{ label: 'Cross-Platform Multiplayer', checked: false },
	{ label: 'In-App Purchases', checked: false },
	{ label: 'Partial Controller Support', checked: false },
	{ label: 'PvP', checked: false },
	{ label: 'Steam Trading Cards', checked: false },
	{ label: 'Steam Leaderboards', checked: false },
	{ label: 'Tracked Controller Support', checked: false },
	{ label: 'VR Only', checked: false },
	{ label: 'VR Supported', checked: false },
	{ label: 'VR Support', checked: false },
	{ label: 'Includes Source SDK', checked: false },
	{ label: 'MMO', checked: false },
	{ label: 'Online PvP', checked: false },
	{ label: 'Online Co-op', checked: false },
	{ label: 'Multi-player', checked: false },
	{ label: 'Remote Play on Tablet', checked: false },
	{ label: 'Valve Anti-Cheat enabled', checked: false },
	{ label: 'Remote Play on TV', checked: false },
	{ label: 'LAN Co-op', checked: false },
	{ label: 'Shared/Split Screen Co-op', checked: false },
	{ label: 'Shared/Split Screen', checked: false },
	{ label: 'Steam Turn Notifications', checked: false },
	{ label: 'Remote Play on Phone', checked: false },
	{ label: 'Commentary available', checked: false },
	{ label: 'Shared/Split Screen PvP', checked: false },
	{ label: 'SteamVR Collectibles', checked: false },
	{ label: 'LAN PvP', checked: false },
	{ label: 'Single-player', checked: false },
]

function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value)

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value)
		}, delay)

		return () => {
			clearTimeout(handler)
		}
	}, [value, delay])

	return debouncedValue
}

export default function GameFeed({ initGames, initTotalGames, searchParamsObj }: GameFeedProps) {
	const [selectedGenres, setSelectedGenres] = useState<string[]>(searchParamsObj.genres ? searchParamsObj.genres.split(',') : [])
	const [selectedCategories, setSelectedCategories] = useState<string[]>(searchParamsObj.categories ? searchParamsObj.categories.split(',') : [])
	const [searchQuery, setSearchQuery] = useState(searchParamsObj.search || '')
	const [searchOption, setSearchOption] = useState(searchParamsObj.searchOption || 'smart-text')
	const [sortOption, setSortOption] = useState(searchParamsObj.sort || 'popularity-desc')
	const [totalGames, setTotalGames] = useState(initTotalGames)

	const debouncedGenres = useDebounce(selectedGenres, 300)
	const debouncedCategories = useDebounce(selectedCategories, 300)
	const debouncedSearchQuery = useDebounce(searchQuery, 300)
	const debouncedSearchOption = useDebounce(searchOption, 300)
	const debouncedSortOption = useDebounce(sortOption, 300)

	const searchParamsURL = useSearchParams()
	const pathname = usePathname()
	const { replace } = useRouter()

	const lastItemRef = useRef<HTMLDivElement>(null)
	const { ref, entry } = useIntersection({
		root: lastItemRef.current,
		threshold: 1,
	})

	const fetchGames = async ({ pageParam = 1 }, cancelToken: CancelToken) => {
		const { data } = await axios.get('/api/games', {
			params: {
				page: pageParam,
				search: debouncedSearchQuery,
				searchOption: debouncedSearchOption,
				genres: debouncedGenres.join(','),
				categories: debouncedCategories.join(','),
				sort: debouncedSortOption,
			},
			cancelToken,
		})
		setTotalGames(data.totalGames)
		return data
	}

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error, refetch } = useInfiniteQuery({
		queryKey: ['games', debouncedSearchQuery, debouncedSearchOption, debouncedGenres, debouncedCategories, debouncedSortOption],
		queryFn: ({ pageParam }) => {
			const source = axios.CancelToken.source()
			const promise = fetchGames({ pageParam }, source.token)
			// @ts-ignore
			promise.cancel = () => {
				source.cancel('Query was cancelled by React Query')
			}
			return promise
		},
		getNextPageParam: (lastPage, allPages) => {
			const nextPage = allPages.length + 1
			return lastPage.games.length > 0 ? nextPage : undefined
		},
		initialPageParam: 1,
		initialData: {
			pages: [{ games: initGames, totalGames: initTotalGames }],
			pageParams: [1],
		},
	})

	const updateURLParams = useCallback(() => {
		const params = new URLSearchParams(searchParamsURL)

		if (debouncedGenres.length === 0) {
			params.delete('genres')
		} else {
			params.set('genres', debouncedGenres.join(','))
		}

		if (debouncedCategories.length === 0) {
			params.delete('categories')
		} else {
			params.set('categories', debouncedCategories.join(','))
		}

		if (debouncedSearchQuery === '') {
			params.delete('search')
		} else {
			params.set('search', debouncedSearchQuery)
		}

		params.set('searchOption', debouncedSearchOption)
		params.set('sort', debouncedSortOption)

		replace(`${pathname}?${params.toString()}`)
	}, [debouncedGenres, debouncedCategories, debouncedSearchQuery, debouncedSearchOption, debouncedSortOption, searchParamsURL, replace, pathname])

	useEffect(() => {
		updateURLParams()
	}, [updateURLParams])

	useEffect(() => {
		if (entry?.isIntersecting) {
			fetchNextPage()
		}
	}, [entry, fetchNextPage])

	const handleGenreCheckboxChange = (genre: string) => {
		setSelectedGenres((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]))
	}

	const handleCategoryCheckboxChange = (category: string) => {
		setSelectedCategories((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]))
	}

	const handleSortChange = (option: string) => {
		if (option === sortOption) return
		setSortOption(option)
	}

	const handleSearchOptionChange = (option: string) => {
		setSearchOption(option)
	}

	const handleSearchQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(event.target.value)
	}

	return (
		<div className='mx-auto min-h-[90vh] p-4 lg:px-16 lg:py-6'>
			<div className='grid grid-cols-1 gap-6 lg:grid-cols-4 xl:grid-cols-6'>
				<aside className='col-span-1 lg:col-span-1'>
					<h2 className='mb-4 text-2xl font-bold'>Genres</h2>
					<div className='max-h-48 space-y-2 overflow-y-scroll lg:max-h-80'>
						{GenreFilters.map((genre) => (
							<div key={genre.label} className='flex items-center space-x-2'>
								<Checkbox
									id={genre.label}
									checked={selectedGenres.includes(genre.label)}
									onClick={() => {
										handleGenreCheckboxChange(genre.label)
									}}
								/>
								<label
									htmlFor={genre.label}
									className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
								>
									{genre.label}
								</label>
							</div>
						))}
					</div>

					<h2 className='mb-4 mt-8 text-2xl font-bold'>Categories</h2>
					<div className='max-h-48 space-y-2 overflow-y-scroll lg:max-h-80'>
						{CategoryFilters.map((category) => (
							<div key={category.label} className='flex items-center space-x-2'>
								<Checkbox
									id={category.label}
									checked={selectedCategories.includes(category.label)}
									onClick={() => {
										handleCategoryCheckboxChange(category.label)
									}}
								/>
								<label
									htmlFor={category.label}
									className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
								>
									{category.label}
								</label>
							</div>
						))}
					</div>
				</aside>
				<div className='col-span-1 lg:col-span-3 xl:col-span-5'>
					<div className='mb-6 flex flex-wrap items-center justify-between gap-2 lg:gap-0'>
						<h1 className='text-3xl font-bold'>Games {totalGames}</h1>

						<div className='flex flex-wrap gap-3 lg:flex-nowrap'>
							<div className='flex items-center space-x-4'>
								<Input
									className='w-64'
									placeholder='Search games...'
									type='search'
									value={searchQuery}
									onChange={handleSearchQueryChange}
								/>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant='outline'>
											<Search className='mr-2 h-4 w-4' />
											Search Option
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align='end' className='w-[200px]'>
										<DropdownMenuRadioGroup value={searchOption} onValueChange={handleSearchOptionChange}>
											<DropdownMenuRadioItem value='smart-text'>
												Smart Text &nbsp; <Brain />
											</DropdownMenuRadioItem>
											<DropdownMenuRadioItem value='ai-search'>
												AI Search &nbsp; <Sparkles />
											</DropdownMenuRadioItem>
										</DropdownMenuRadioGroup>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
							<div className='flex items-center space-x-4'>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant='outline'>
											<ArrowUpDown className='mr-2 h-4 w-4' />
											Sort by
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align='end' className='w-[200px]'>
										<DropdownMenuRadioGroup value={sortOption} onValueChange={handleSortChange}>
											<DropdownMenuRadioItem value='popularity-asc'>
												Popularity &nbsp; <ArrowUpDown />
											</DropdownMenuRadioItem>
											<DropdownMenuRadioItem value='popularity-desc'>
												Popularity &nbsp; <ArrowDownUp />
											</DropdownMenuRadioItem>

											<DropdownMenuRadioItem value='name-asc'>
												Name &nbsp; <ArrowUpDown />
											</DropdownMenuRadioItem>
											<DropdownMenuRadioItem value='name-desc'>
												Name &nbsp; <ArrowDownUp />
											</DropdownMenuRadioItem>

											<DropdownMenuRadioItem value='releaseDate-asc'>
												Release Date &nbsp; <ArrowUpDown />
											</DropdownMenuRadioItem>
											<DropdownMenuRadioItem value='releaseDate-desc'>
												Release Date &nbsp; <ArrowDownUp />
											</DropdownMenuRadioItem>
										</DropdownMenuRadioGroup>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
					</div>

					<div className='grid auto-rows-fr grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
						{status === 'success' &&
							data.pages
								.flatMap((page) => page.games)
								.map((game: ExtendedGame, index: number) => {
									if (index === data.pages.flatMap((page) => page.games).length - 1) {
										return <GameCard key={game.id} votesAmt={game.voteCount} currentVote={game.voteType} ref={ref} game={game} />
									}

									return <GameCard key={game.id} votesAmt={game.voteCount} currentVote={game.voteType} game={game} />
								})}
					</div>
					{isFetchingNextPage && (
						<div className='flex justify-center items-center h-32'>
							<div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white' />
						</div>
					)}
					{!hasNextPage && status === 'success' && <div className='text-center py-4 text-gray-600'>No more games to load</div>}
					{status === 'error' && <div className='text-center py-4 text-red-600'>Error: {(error as Error).message}</div>}
				</div>
			</div>
		</div>
	)
}

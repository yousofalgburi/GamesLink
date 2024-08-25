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
import { toast } from './ui/use-toast'

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
	{ label: 'Indie', count: 73171, checked: false },
	{ label: 'Action', count: 45503, checked: false },
	{ label: 'Adventure', count: 43038, checked: false },
	{ label: 'Casual', count: 40750, checked: false },
	{ label: 'Simulation', count: 20960, checked: false },
	{ label: 'Strategy', count: 20752, checked: false },
	{ label: 'RPG', count: 20377, checked: false },
	{ label: 'Early Access', count: 11366, checked: false },
	{ label: 'Free to Play', count: 8832, checked: false },
	{ label: 'Sports', count: 4442, checked: false },
	{ label: 'Racing', count: 3832, checked: false },
	{ label: 'Massively Multiplayer', count: 2929, checked: false },
	{ label: 'Utilities', count: 911, checked: false },
	{ label: 'Design & Illustration', count: 520, checked: false },
	{ label: 'Violent', count: 470, checked: false },
	{ label: 'Education', count: 417, checked: false },
	{ label: 'Animation & Modeling', count: 416, checked: false },
	{ label: 'Video Production', count: 302, checked: false },
	{ label: 'Gore', count: 288, checked: false },
	{ label: 'Game Development', count: 276, checked: false },
	{ label: 'Software Training', count: 208, checked: false },
	{ label: 'Audio Production', count: 205, checked: false },
	{ label: 'Photo Editing', count: 142, checked: false },
	{ label: 'Web Publishing', count: 101, checked: false },
]

const CategoryFilters = [
	{ label: 'Single-player', count: 96991, checked: false },
	{ label: 'Family Sharing', count: 67600, checked: false },
	{ label: 'Steam Achievements', count: 45839, checked: false },
	{ label: 'Full controller support', count: 25129, checked: false },
	{ label: 'Steam Cloud', count: 23496, checked: false },
	{ label: 'Multi-player', count: 20964, checked: false },
	{ label: 'Partial Controller Support', count: 13414, checked: false },
	{ label: 'PvP', count: 13176, checked: false },
	{ label: 'Co-op', count: 11594, checked: false },
	{ label: 'Steam Trading Cards', count: 10089, checked: false },
	{ label: 'Online PvP', count: 9723, checked: false },
	{ label: 'Steam Leaderboards', count: 7969, checked: false },
	{ label: 'Remote Play Together', count: 7581, checked: false },
	{ label: 'Online Co-op', count: 7438, checked: false },
	{ label: 'Shared/Split Screen', count: 7238, checked: false },
	{ label: 'Tracked Controller Support', count: 5676, checked: false },
	{ label: 'VR Only', count: 5533, checked: false },
	{ label: 'Shared/Split Screen PvP', count: 5039, checked: false },
	{ label: 'Stats', count: 4648, checked: false },
	{ label: 'Shared/Split Screen Co-op', count: 4302, checked: false },
	{ label: 'Cross-Platform Multiplayer', count: 3190, checked: false },
	{ label: 'In-App Purchases', count: 2880, checked: false },
	{ label: 'Steam Workshop', count: 2543, checked: false },
	{ label: 'Includes level editor', count: 2437, checked: false },
	{ label: 'Remote Play on TV', count: 2372, checked: false },
	{ label: 'Captions available', count: 2082, checked: false },
	{ label: 'MMO', count: 1670, checked: false },
	{ label: 'LAN Co-op', count: 1296, checked: false },
	{ label: 'LAN PvP', count: 1272, checked: false },
	{ label: 'VR Supported', count: 1207, checked: false },
	{ label: 'Remote Play on Tablet', count: 981, checked: false },
	{ label: 'Remote Play on Phone', count: 834, checked: false },
	{ label: 'Commentary available', count: 360, checked: false },
	{ label: 'HDR available', count: 266, checked: false },
	{ label: 'VR Support', count: 243, checked: false },
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

export default function GameFeed({ initGames, initTotalGames, searchParamsObj, session }: GameFeedProps) {
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
		try {
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
			if (data.isNewGeneration) {
				toast({
					title: 'New AI embedding generated',
					description: 'Your AI search results are now up to date.',
					duration: 3000,
				})
			}
			return data
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 429) {
				toast({
					title: 'AI search rate limit reached. Please try again later.',
					description: 'You have reached the rate limit for AI search. Please try again later.',
					duration: 5000,
				})
				setSearchOption('smart-text')
			}
			throw error
		}
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
		if (option === 'ai-search' && !session?.user) {
			toast({
				title: 'Please log in to use AI search.',
				description: 'You need to be logged in to use AI search.',
				variant: 'destructive',
				duration: 5000,
			})
			return
		}
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
									{genre.label} ({genre.count})
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
									{category.label} ({category.count})
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

					<div className='grid auto-rows-fr grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3'>
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

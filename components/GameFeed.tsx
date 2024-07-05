'use client'

import GameCard from '@/components/GameCard'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { VoteType } from '@/constants/enums'
import type { ExtendedGame } from '@/types/db'
import { useIntersection } from '@mantine/hooks'
import axios from 'axios'
import { ArrowDownUp, ArrowUpDown, Brain, Search, Sparkles } from 'lucide-react'
import type { Session } from 'next-auth'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

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

export default function GameFeed({ initGames, initTotalGames, searchParamsObj, session }: GameFeedProps) {
	const [selectedGenres, setSelectedGenres] = useState<string[]>(searchParamsObj.genres ? searchParamsObj.genres.split(',') : [])
	const [selectedCategories, setSelectedCategories] = useState<string[]>(searchParamsObj.categories ? searchParamsObj.categories.split(',') : [])
	const [searchQuery, setSearchQuery] = useState(searchParamsObj.search)
	const [searchOption, setSearchOption] = useState(searchParamsObj.searchOption || 'smart-text')
	const [sortOption, setSortOption] = useState(searchParamsObj.sort || 'popularity-desc')

	const [games, setGames] = useState<ExtendedGame[] | null>(initGames)
	const [totalGames, setTotalGames] = useState(initTotalGames)
	const [shouldFetchData, setShouldFetchData] = useState(false)
	const [searchParams, setSearchParams] = useState(searchParamsObj)
	const hasMounted = useRef(false)

	const searchParamsURL = useSearchParams()
	const pathname = usePathname()
	const { replace } = useRouter()

	// ref to the last post and the intersection observer
	const lastPostRef = useRef<HTMLElement>(null)
	const { ref, entry } = useIntersection({
		root: lastPostRef.current,
		threshold: 0.6,
	})

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const handler = setTimeout(() => {
			if (!hasMounted.current) {
				hasMounted.current = true
				return
			}

			setGames(null)
			setShouldFetchData(true)

			setSearchParams((prev) => ({
				...prev,
				page: 1,
				search: searchQuery,
				searchOption: searchOption,
				genres: selectedGenres.join(','),
				categories: selectedCategories.join(','),
				sort: sortOption,
			}))
		}, 300) // debounce the search query

		const params = new URLSearchParams(searchParamsURL)

		if (selectedGenres.length === 0) {
			params.delete('genres')
		} else {
			params.set('genres', selectedGenres.join(','))
		}

		if (selectedCategories.length === 0) {
			params.delete('categories')
		} else {
			params.set('categories', selectedCategories.join(','))
		}

		if (searchQuery === '') {
			params.delete('search')
		} else {
			params.set('search', searchQuery)
		}

		params.set('searchOption', searchOption)
		params.set('sort', sortOption)

		replace(`${pathname}?${params.toString()}`)

		return () => {
			clearTimeout(handler)
			setShouldFetchData(false)
		}
	}, [selectedGenres, selectedCategories, searchQuery, searchOption, sortOption])

	// the use effect that handles the intersection logic
	useEffect(() => {
		if (entry?.isIntersecting) {
			setShouldFetchData(true)
			setSearchParams((prev) => ({ ...prev, page: prev.page + 1 }))
		}
	}, [entry])

	// the use effect that handles the fetching logic
	useEffect(() => {
		const getGamesData = async () => {
			if (shouldFetchData) {
				const { data } = await axios.get(
					`/api/games?page=${searchParams.page}&search=${searchParams.search}&searchOption=${searchParams.searchOption}&genres=${searchParams.genres}&categories=${searchParams.categories}&sort=${searchParams.sort}`,
				)

				if (data.games) {
					setGames((prevGames) => (prevGames ? [...prevGames, ...data.games] : data.games))
				}

				console.log(data.totalGames)
				setTotalGames(data.totalGames)
				setShouldFetchData(false)
			}
		}

		getGamesData()
	}, [searchParams, shouldFetchData])

	// the function that handles the genre checkbox changes
	const handleGenreCheckboxChange = (genre: string) => {
		const isAlreadySelected = selectedGenres.includes(genre)
		const updatedGenres = isAlreadySelected ? selectedGenres.filter((g) => g !== genre) : [...selectedGenres, genre]
		setSelectedGenres(updatedGenres)
	}

	// the function that handles the categories checkbox changes
	const handleCategoryCheckboxChange = (category: string) => {
		const isAlreadySelected = selectedCategories.includes(category)
		const updatedCategories = isAlreadySelected ? selectedCategories.filter((c) => c !== category) : [...selectedCategories, category]
		setSelectedCategories(updatedCategories)
	}

	// the function that handles the sort option changes
	const handleSortChange = (option: string) => {
		if (option === sortOption) return
		setSortOption(option)
	}

	// handles the search option changes
	const handleSearchOptionChange = (option: string) => {
		setSearchOption(option)
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
						<h1 className='text-3xl font-bold'>Games ({totalGames})</h1>

						<div className='flex flex-wrap gap-3 lg:flex-nowrap'>
							<div className='flex items-center space-x-4'>
								<Input
									className='w-64'
									placeholder='Search games...'
									type='search'
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
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
						{games?.map((game, index) => {
							const votesAmt = game.votes.reduce((acc, vote) => {
								if (vote.type === VoteType.UP) return acc + 1
								if (vote.type === VoteType.DOWN) return acc - 1
								return acc
							}, 0)

							const currentVote = game.votes.find((vote) => vote.userId === session?.user.id)

							if (index === games.length - 1) {
								return (
									<GameCard key={game.id} votesAmt={votesAmt} currentVote={currentVote?.type as VoteType} ref={ref} game={game} />
								)
							}

							return <GameCard key={game.id} votesAmt={votesAmt} currentVote={currentVote?.type as VoteType} game={game} />
						})}
					</div>
				</div>
			</div>
		</div>
	)
}

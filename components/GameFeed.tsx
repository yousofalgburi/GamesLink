'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    DropdownMenuTrigger,
    DropdownMenuRadioItem,
    DropdownMenuRadioGroup,
    DropdownMenuContent,
    DropdownMenu,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import GameCard from '@/components/GameCard'
import { useIntersection } from '@mantine/hooks'
import axios from 'axios'
import { ArrowDownUp, ArrowUpDown } from 'lucide-react'
import { ExtendedGame } from '@/types/db'
import { Session } from 'next-auth'

interface GameFeedProps {
    initGames: ExtendedGame[]
    initTotalGames: number
    searchParamsObj: {
        page: number
        search: string
        genres: string
        categories: string
        sort: string
    }
    session: Session | null
}

const GenreFilters = [
    { value: 'accounting', label: 'Accounting', checked: false },
    { value: 'action', label: 'Action', checked: false },
    { value: 'adventure', label: 'Adventure', checked: false },
    { value: 'aktion', label: 'Aktion', checked: false },
    { value: 'audioproduction', label: 'Audio Production', checked: false },
    { value: 'casual', label: 'Casual', checked: false },
    { value: 'earlyaccess', label: 'Early Access', checked: false },
    { value: 'education', label: 'Education', checked: false },
    { value: 'freetoplay', label: 'Free to Play', checked: false },
    { value: 'gamedevelopment', label: 'Game Development', checked: false },
    { value: 'gore', label: 'Gore', checked: false },
    { value: 'indie', label: 'Indie', checked: false },
    { value: 'photoediting', label: 'Photo Editing', checked: false },
    { value: 'racing', label: 'Racing', checked: false },
    { value: 'rpg', label: 'RPG', checked: false },
    { value: 'simulation', label: 'Simulation', checked: false },
    { value: 'softwaretraining', label: 'Software Training', checked: false },
    { value: 'sports', label: 'Sports', checked: false },
    { value: 'strategy', label: 'Strategy', checked: false },
    { value: 'utilities', label: 'Utilities', checked: false },
    { value: 'videoproduction', label: 'Video Production', checked: false },
    { value: 'violent', label: 'Violent', checked: false },
    { value: 'webpublishing', label: 'Web Publishing', checked: false },
]

const CategoryFilters = [
    {
        value: 'captions_available',
        label: 'Captions available',
        checked: false,
    },
    { value: 'steam_cloud', label: 'Steam Cloud', checked: false },
    {
        value: 'includes_level_editor',
        label: 'Includes level editor',
        checked: false,
    },
    { value: 'steam_workshop', label: 'Steam Workshop', checked: false },
    { value: 'stats', label: 'Stats', checked: false },
    {
        value: 'remote_play_together',
        label: 'Remote Play Together',
        checked: false,
    },
    { value: 'co_op', label: 'Co-op', checked: false },
    {
        value: 'steam_achievements',
        label: 'Steam Achievements',
        checked: false,
    },
    {
        value: 'full_controller_support',
        label: 'Full controller support',
        checked: false,
    },
    {
        value: 'cross_platform_multiplayer',
        label: 'Cross-Platform Multiplayer',
        checked: false,
    },
    { value: 'in_app_purchases', label: 'In-App Purchases', checked: false },
    {
        value: 'partial_controller_support',
        label: 'Partial Controller Support',
        checked: false,
    },
    { value: 'pvp', label: 'PvP', checked: false },
    {
        value: 'steam_trading_cards',
        label: 'Steam Trading Cards',
        checked: false,
    },
    {
        value: 'steam_leaderboards',
        label: 'Steam Leaderboards',
        checked: false,
    },
    {
        value: 'tracked_controller_support',
        label: 'Tracked Controller Support',
        checked: false,
    },
    { value: 'vr_only', label: 'VR Only', checked: false },
    { value: 'vr_supported', label: 'VR Supported', checked: false },
    { value: 'vr_support', label: 'VR Support', checked: false },
    {
        value: 'includes_source_sdk',
        label: 'Includes Source SDK',
        checked: false,
    },
    { value: 'mmo', label: 'MMO', checked: false },
    { value: 'online_pvp', label: 'Online PvP', checked: false },
    { value: 'online_co_op', label: 'Online Co-op', checked: false },
    { value: 'multi_player', label: 'Multi-player', checked: false },
    {
        value: 'remote_play_on_tablet',
        label: 'Remote Play on Tablet',
        checked: false,
    },
    {
        value: 'valve_anti_cheat_enabled',
        label: 'Valve Anti-Cheat enabled',
        checked: false,
    },
    { value: 'remote_play_on_tv', label: 'Remote Play on TV', checked: false },
    { value: 'lan_co_op', label: 'LAN Co-op', checked: false },
    {
        value: 'shared_split_screen_co_op',
        label: 'Shared/Split Screen Co-op',
        checked: false,
    },
    {
        value: 'shared_split_screen',
        label: 'Shared/Split Screen',
        checked: false,
    },
    {
        value: 'steam_turn_notifications',
        label: 'Steam Turn Notifications',
        checked: false,
    },
    {
        value: 'remote_play_on_phone',
        label: 'Remote Play on Phone',
        checked: false,
    },
    {
        value: 'commentary_available',
        label: 'Commentary available',
        checked: false,
    },
    {
        value: 'shared_split_screen_pvp',
        label: 'Shared/Split Screen PvP',
        checked: false,
    },
    {
        value: 'steamvr_collectibles',
        label: 'SteamVR Collectibles',
        checked: false,
    },
    { value: 'lan_pvp', label: 'LAN PvP', checked: false },
    { value: 'single_player', label: 'Single-player', checked: false },
]

export default function GameFeed({ initGames, initTotalGames, searchParamsObj, session }: GameFeedProps) {
    // states to manage the filters
    const [selectedGenres, setSelectedGenres] = useState<{ label: string; value: string }[]>([])
    const [selectedCategories, setSelectedCategories] = useState<{ label: string; value: string }[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [sortOption, setSortOption] = useState('popularity-desc')
    const [games, setGames] = useState<ExtendedGame[] | null>(initGames)
    const [totalGames, setTotalGames] = useState(initTotalGames)
    const [shouldFetchData, setShouldFetchData] = useState(false)
    const [searchParams, setSearchParams] = useState(searchParamsObj)
    const hasMounted = useRef(false)

    // ref to the last post and the intersection observer
    const lastPostRef = useRef<HTMLElement>(null)
    const { ref, entry } = useIntersection({
        root: lastPostRef.current,
        threshold: 0.8,
    })

    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true
            return
        }

        const handler = setTimeout(() => {
            setGames(null)
            setShouldFetchData(true)

            setSearchParams((prev) => ({
                ...prev,
                page: 1,
                search: searchQuery,
                genres: selectedGenres.map((g) => g.label).join(','),
                categories: selectedCategories.map((c) => c.label).join(','),
                sort: sortOption,
            }))
        }, 300)

        return () => {
            clearTimeout(handler)
            setShouldFetchData(false)
        }
    }, [selectedGenres, selectedCategories, searchQuery, sortOption])

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
                    `/api/games?page=${searchParams.page}&search=${searchParams.search}&genres=${searchParams.genres}&categories=${searchParams.categories}&sort=${searchParams.sort}`
                )

                if (data.games) {
                    setGames((prevGames) => (prevGames ? [...prevGames, ...data.games] : data.games))
                }

                setTotalGames(data.totalGames)
                setShouldFetchData(false)
            }
        }

        getGamesData()
    }, [searchParams, shouldFetchData])

    // the function that handles the genre checkbox changes
    const handleGenreCheckboxChange = (genre: { label: string; value: string }) => {
        const isAlreadySelected = selectedGenres.some((g) => g.value === genre.value)
        const updatedGenres = isAlreadySelected
            ? selectedGenres.filter((g) => g.value !== genre.value)
            : [...selectedGenres, genre]

        setSelectedGenres(updatedGenres)
    }

    // the function that handles the categories checkbox changes
    const handleCategoryCheckboxChange = (category: { label: string; value: string }) => {
        const isAlreadySelected = selectedCategories.some((c) => c.value === category.value)
        const updatedCategories = isAlreadySelected
            ? selectedCategories.filter((c) => c.value !== category.value)
            : [...selectedCategories, category]

        setSelectedCategories(updatedCategories)
    }

    // the function that handles the sort option changes
    const handleSortChange = (option: string) => {
        if (option === sortOption) return
        setSortOption(option)
    }

    return (
        <div className="mx-auto min-h-[90vh] px-16 py-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 xl:grid-cols-6">
                <aside className="col-span-1 lg:col-span-1">
                    <h2 className="mb-4 text-2xl font-bold">Genres</h2>
                    <div className="max-h-48 space-y-2 overflow-y-scroll lg:max-h-80">
                        {GenreFilters.map((genre) => (
                            <div key={genre.value} className="flex items-center space-x-2">
                                <Checkbox
                                    id={genre.value}
                                    checked={selectedGenres.includes(genre)}
                                    onClick={() => {
                                        handleGenreCheckboxChange(genre)
                                    }}
                                />
                                <label
                                    htmlFor={genre.value}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {genre.label}
                                </label>
                            </div>
                        ))}
                    </div>

                    <h2 className="mb-4 mt-8 text-2xl font-bold">Categories</h2>
                    <div className="max-h-48 space-y-2 overflow-y-scroll lg:max-h-80">
                        {CategoryFilters.map((category) => (
                            <div key={category.value} className="flex items-center space-x-2">
                                <Checkbox
                                    id={category.value}
                                    checked={selectedCategories.includes(category)}
                                    onClick={() => {
                                        handleCategoryCheckboxChange(category)
                                    }}
                                />
                                <label
                                    htmlFor={category.value}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {category.label}
                                </label>
                            </div>
                        ))}
                    </div>
                </aside>
                <div className="col-span-1 lg:col-span-3 xl:col-span-5">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-2 lg:gap-0">
                        <h1 className="text-3xl font-bold">Games ({totalGames})</h1>

                        <div className="flex gap-3">
                            <div className="flex items-center space-x-4">
                                <Input
                                    className="w-64"
                                    placeholder="Search games..."
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center space-x-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">
                                            <ArrowUpDown className="mr-2 h-4 w-4" />
                                            Sort by
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[200px]">
                                        <DropdownMenuRadioGroup value={sortOption} onValueChange={handleSortChange}>
                                            <DropdownMenuRadioItem value="popularity-asc">
                                                Popularity &nbsp; <ArrowUpDown />
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="popularity-desc">
                                                Popularity &nbsp; <ArrowDownUp />
                                            </DropdownMenuRadioItem>

                                            <DropdownMenuRadioItem value="name-asc">
                                                Name &nbsp; <ArrowUpDown />
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="name-desc">
                                                Name &nbsp; <ArrowDownUp />
                                            </DropdownMenuRadioItem>

                                            <DropdownMenuRadioItem value="releaseDate-asc">
                                                Release Date &nbsp; <ArrowUpDown />
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="releaseDate-desc">
                                                Release Date &nbsp; <ArrowDownUp />
                                            </DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 px-2">
                        {games &&
                            games.map((game, index) => {
                                const votesAmt = game.votes.reduce((acc, vote) => {
                                    if (vote.type === 'UP') return acc + 1
                                    if (vote.type === 'DOWN') return acc - 1
                                    return acc
                                }, 0)

                                const currentVote = game.votes.find((vote) => vote.userId === session?.user.id)

                                if (index === games.length - 1) {
                                    return (
                                        <GameCard
                                            key={index}
                                            votesAmt={votesAmt}
                                            currentVote={currentVote}
                                            ref={ref}
                                            game={game}
                                        />
                                    )
                                }

                                return (
                                    <GameCard key={index} votesAmt={votesAmt} currentVote={currentVote} game={game} />
                                )
                            })}
                    </div>
                </div>
                fF
            </div>
        </div>
    )
}

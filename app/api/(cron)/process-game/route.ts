import { db } from '@/lib/db'
import axios from 'axios'

export async function POST(req, res) {
	const game = await db.game.findFirst({
		where: {
			loaded: false,
		},
	})

	if (!game) {
		return Response.json({ message: 'No unprocessed games found' })
	}

	try {
		const response = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${game.appId}`)
		const data = response.data[game.appId]?.data

		if (!data || !data.success) {
			await db.game.update({
				where: { appId: game.appId },
				data: { loaded: true, loadedDate: new Date() },
			})
			return Response.json({ message: `No data found for game ${game.appId}` })
		}

		const processedGame = {
			appId: game.appId,
			name: data.name,
			type: data.type,
			requiredAge: data.required_age,
			isFree: data.is_free,
			dlc: data.dlc || [],
			detailedDescription: data.detailed_description,
			aboutTheGame: data.about_the_game,
			shortDescription: data.short_description,
			supportedLanguages: data.supported_languages,
			reviews: data.reviews,
			headerImage: data.header_image,
			capsuleImage: data.capsule_image,
			capsuleImagev5: data.capsule_imagev5,
			website: data.website,
			developers: data.developers,
			publishers: data.publishers,
			background: data.background,
			backgroundRaw: data.background_raw,
			recommendations: data.recommendations?.total,
			platforms: {
				create: {
					windows: data.platforms.windows,
					mac: data.platforms.mac,
					linux: data.platforms.linux,
				},
			},
			releaseDate: {
				create: {
					comingSoon: data.release_date.coming_soon,
					date: data.release_date.date,
				},
			},
			supportInfo: {
				create: {
					url: data.support_info?.url,
					email: data.support_info?.email,
				},
			},
			contentDescriptors: data.content_descriptors
				? {
						create: {
							ids: data.content_descriptors.ids,
							notes: data.content_descriptors.notes,
						},
					}
				: undefined,
			categories: {
				create:
					data.categories?.map((category) => ({
						description: category.description,
					})) || [],
			},
			genres: {
				create:
					data.genres?.map((genre) => ({
						description: genre.description,
					})) || [],
			},
			screenshots: {
				create:
					data.screenshots?.map((screenshot) => ({
						pathThumbnail: screenshot.path_thumbnail,
						pathFull: screenshot.path_full,
					})) || [],
			},
			movies: {
				create:
					data.movies?.map((movie) => ({
						name: movie.name,
						thumbnail: movie.thumbnail,
						webm: movie.webm,
						mp4: movie.mp4,
						highlight: movie.highlight,
					})) || [],
			},
			achievements: {
				create:
					data.achievements?.highlighted?.map((achievement) => ({
						name: achievement.name,
						path: achievement.path,
					})) || [],
			},
			priceOverview: data.price_overview
				? {
						create: {
							currency: data.price_overview.currency,
							initial: data.price_overview.initial,
							final: data.price_overview.final,
							discountPercent: data.price_overview.discount_percent,
							initialFormatted: data.price_overview.initial_formatted,
							finalFormatted: data.price_overview.final_formatted,
						},
					}
				: undefined,
			additionalData: {},
		}

		const knownFields = new Set([
			'appId',
			'name',
			'type',
			'required_age',
			'is_free',
			'dlc',
			'detailed_description',
			'about_the_game',
			'short_description',
			'supported_languages',
			'reviews',
			'header_image',
			'capsule_image',
			'capsule_imagev5',
			'website',
			'developers',
			'publishers',
			'background',
			'background_raw',
			'release_date',
			'support_info',
			'content_descriptors',
			'categories',
			'genres',
			'screenshots',
			'movies',
			'achievements',
			'platforms',
			'price_overview',
			'pc_requirements',
			'mac_requirements',
			'linux_requirements',
		])

		const additionalData = {}
		for (const [key, value] of Object.entries(data)) {
			if (!knownFields.has(key)) {
				additionalData[key] = value
			}
		}

		if (Object.keys(additionalData).length > 0) {
			processedGame.additionalData = additionalData
		}

		await db.processedGame.create({
			data: processedGame,
		})

		await db.game.update({
			where: { appId: game.appId },
			data: { loaded: true, loadedDate: new Date() },
		})

		return Response.json({ message: 'Game processed' })
	} catch (error: unknown) {
		return Response.json({ message: `Error processing game ${game.appId}:` })
	}
}

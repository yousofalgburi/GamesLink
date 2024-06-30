import { type Game, PrismaClient, type Prisma } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

export default {
	async scheduled(controller, env: Env, ctx): Promise<void> {
		switch (controller.cron) {
			case '0 0 * * *':
				await syncGames(env)
				break
			case '* * * * *':
				await processGames(env)
				break
		}
		console.log('Cron job completed')
	},
}

async function syncGames(env): Promise<void> {
	const db = new PrismaClient({
		datasources: {
			db: {
				url: env.DATABASE_URL,
			},
		},
	}).$extends(withAccelerate())

	const response = await fetch('https://api.steampowered.com/ISteamApps/GetAppList/v2')
	const data = await response.json()
	const apps = data.applist.apps

	const existingAppIds = await db.game.findMany({
		select: {
			appId: true,
		},
	})
	const existingAppIdSet = new Set(existingAppIds.map((app) => app.appId))
	const newApps: Game[] = []
	const maxGames = 10000
	let currentGames = 0

	for (const app of apps) {
		if (!existingAppIdSet.has(app.appid.toString())) {
			newApps.push({
				appId: app.appid.toString(),
				name: app.name || '',
				loaded: false,
				loadedDate: null,
				createdAt: new Date(),
			})
			currentGames++

			if (currentGames >= maxGames) {
				break
			}
		}
	}

	await db.game.createMany({
		data: newApps,
		skipDuplicates: true,
	})

	console.log('Successfully synced games')
}

async function processGames(env): Promise<void> {
	const db = new PrismaClient({
		datasources: {
			db: {
				url: env.DATABASE_URL,
			},
		},
	}).$extends(withAccelerate())

	const game = await db.game.findFirst({
		where: {
			loaded: false,
		},
	})

	if (!game) {
		console.log('No unprocessed games found')
		return
	}

	try {
		const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${game.appId}`)
		const gameData = await response.json()

		if (!gameData || !gameData[game.appId].success) {
			console.log(`No data found for game ${game.appId}`)
			return
		}

		const data = gameData[game.appId].data

		const processedGame: Prisma.ProcessedGameCreateInput = {
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

		// Handle additional data
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
			processedGame.additionalData = additionalData as Prisma.InputJsonValue
		}

		await db.processedGame.create({
			data: processedGame,
		})

		await db.game.update({
			where: { appId: game.appId },
			data: { loaded: true, loadedDate: new Date() },
		})

		console.log(`Processed game ${game.appId}`)
	} catch (error) {
		console.error(`Error processing game ${game.appId}:`, error)
	}
}

import { db } from '@/lib/db'
import axios from 'axios'

export const maxDuration = 25

export async function POST(req, res) {
	const startTime = Date.now()
	const timeLimit = maxDuration * 1000 - 1000
	let gamesProcessed = 0
	const games = await db.game.findMany({
		where: { loaded: false },
		take: 100,
	})

	while (Date.now() - startTime < timeLimit && gamesProcessed[gamesProcessed] !== undefined) {
		if (!games[gamesProcessed]) {
			break
		}

		try {
			const response = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${games[gamesProcessed].appId}`)
			const data = response.data[games[gamesProcessed].appId]?.data

			if (!data) {
				await db.game.update({
					where: { appId: games[gamesProcessed].appId },
					data: { loaded: true, loadedDate: new Date() },
				})
				gamesProcessed++
				continue
			}

			const processedGame = {
				appId: games[gamesProcessed].appId,
				name: data.name || '',
				type: data.type || '',
				requiredAge: Number.parseInt(data.required_age, 10) || 0,
				isFree: !!data.is_free,
				dlc: JSON.stringify(data.dlc || []),
				detailedDescription: data.detailed_description || '',
				aboutTheGame: data.about_the_game || '',
				shortDescription: data.short_description || '',
				supportedLanguages: data.supported_languages || '',
				reviews: data.reviews || null,
				headerImage: data.header_image || '',
				capsuleImage: data.capsule_image || '',
				capsuleImagev5: data.capsule_imagev5 || '',
				website: data.website || '',
				developers: JSON.stringify(data.developers || []),
				publishers: JSON.stringify(data.publishers || []),
				background: data.background || '',
				backgroundRaw: data.background_raw || '',
				recommendations: data.recommendations?.total || null,
				platforms: {
					create: {
						windows: !!data.platforms?.windows,
						mac: !!data.platforms?.mac,
						linux: !!data.platforms?.linux,
					},
				},
				releaseDate: data.release_date
					? {
							create: {
								comingSoon: !!data.release_date.coming_soon,
								date: data.release_date.date ?? '',
							},
						}
					: undefined,
				supportInfo: data.support_info
					? {
							create: {
								url: data.support_info.url || '',
								email: data.support_info.email || '',
							},
						}
					: undefined,
				contentDescriptors: data.content_descriptors
					? {
							create: {
								ids: JSON.stringify(data.content_descriptors.ids || []),
								notes: data.content_descriptors.notes || null,
							},
						}
					: undefined,
				categories: {
					create:
						data.categories?.map((category) => ({
							description: category.description || '',
						})) || [],
				},
				genres: {
					create:
						data.genres?.map((genre) => ({
							description: genre.description || '',
						})) || [],
				},
				screenshots: {
					create:
						data.screenshots?.map((screenshot) => ({
							pathThumbnail: screenshot.path_thumbnail || '',
							pathFull: screenshot.path_full || '',
						})) || [],
				},
				movies: {
					create:
						data.movies?.map((movie) => ({
							name: movie.name || '',
							thumbnail: movie.thumbnail || '',
							webm: JSON.stringify(movie.webm || {}),
							mp4: JSON.stringify(movie.mp4 || {}),
							highlight: !!movie.highlight,
						})) || [],
				},
				achievements: {
					create:
						data.achievements?.highlighted?.map((achievement) => ({
							name: achievement.name || '',
							path: achievement.path || '',
						})) || [],
				},
				priceOverview: data.price_overview
					? {
							create: {
								currency: data.price_overview.currency || '',
								initial: data.price_overview.initial || 0,
								final: data.price_overview.final || 0,
								discountPercent: data.price_overview.discount_percent || 0,
								initialFormatted: data.price_overview.initial_formatted || '',
								finalFormatted: data.price_overview.final_formatted || '',
							},
						}
					: undefined,
				ratings: {
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					create: Object.entries(data.ratings || {}).map(([source, ratingData]: [string, any]) => ({
						source,
						ratingGenerated: ratingData?.rating_generated || '',
						rating: ratingData?.rating || '',
						requiredAge: ratingData?.required_age || '',
						banned: ratingData?.banned || '',
						useAgeGate: ratingData?.use_age_gate || '',
						descriptors: ratingData?.descriptors ? JSON.stringify(ratingData.descriptors) : null,
					})),
				},
				legalNotice: data.legal_notice || null,
				controllerSupport: data.controller_support || null,
				fullgame: JSON.stringify(data.fullgame) ?? null,
				steamAppid: data.steam_appid || null,
				packageGroups: {
					create:
						data.package_groups?.map((group) => ({
							name: group.name || '',
							title: group.title || '',
							description: group.description || '',
							selectionText: group.selection_text || '',
							saveText: group.save_text || '',
							displayType: Number.parseInt(group.display_type || '0', 10),
							isRecurringSubscription: group.is_recurring_subscription || '',
							subs: {
								create:
									group.subs?.map((sub) => ({
										packageid: sub.packageid || 0,
										percentSavingsText: sub.percent_savings_text || '',
										percentSavings: sub.percent_savings || 0,
										optionText: sub.option_text || '',
										optionDescription: sub.option_description || '',
										canGetFreeLicense: sub.can_get_free_license || '',
										isFreeLicense: !!sub.is_free_license,
										priceInCentsWithDiscount: sub.price_in_cents_with_discount || 0,
									})) || [],
							},
						})) || [],
				},
				packages: JSON.stringify(data.packages || []),
				demos: {
					create: data.demos
						? Array.from(new Set(data.demos.map((demo) => demo.appid))).map((appid) => ({
								appid: Number.parseInt(appid as string, 10) || 0,
								description: data.demos.find((demo) => demo.appid === appid).description || '',
							}))
						: [],
				},
				metacritic: data.metacritic
					? {
							create: {
								url: data.metacritic.url || null,
								score: data.metacritic.score || null,
							},
						}
					: undefined,
				extUserAccountNotice: data.ext_user_account_notice || null,
				additionalData: JSON.stringify({}),
			}

			// for (const key of Object.keys(processedGame)) {
			// 	if (processedGame[key] === undefined) {
			// 		delete processedGame[key]
			// 	} else if (typeof processedGame[key] === 'object' && processedGame[key] !== null) {
			// 		for (const subKey of Object.keys(processedGame[key])) {
			// 			if (processedGame[key][subKey] === undefined) {
			// 				delete processedGame[key][subKey]
			// 			}
			// 		}
			// 		if (Object.keys(processedGame[key]).length === 0) {
			// 			delete processedGame[key]
			// 		}
			// 	}
			// }

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
				'legal_notice',
				'controller_support',
				'fullgame',
				'steam_appid',
				'package_groups',
				'packages',
				'ratings',
				'recommendations',
				'demos',
				'metacritic',
				'ext_user_account_notice',
			])

			const additionalData = {}
			for (const [key, value] of Object.entries(data)) {
				if (!knownFields.has(key)) {
					additionalData[key] = value
				}
			}

			if (Object.keys(additionalData).length > 0) {
				processedGame.additionalData = JSON.stringify(additionalData)
			}

			await db.processedGame.create({
				data: processedGame,
			})

			await db.game.update({
				where: { appId: games[gamesProcessed].appId },
				data: { loaded: true, loadedDate: new Date() },
			})

			gamesProcessed++
		} catch (error: unknown) {
			console.error(`Error processing game ${games[gamesProcessed].appId}:`, error)
			if (error instanceof Error) {
				console.error(error.stack)
			}
			break
		}
	}

	return Response.json({ message: `Processed ${gamesProcessed} games` })
}

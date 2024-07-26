import { db } from '@/lib/db'
import {
	processedGames,
	pcRequirements,
	macRequirements,
	linuxRequirements,
	supportInfo,
	contentDescriptors,
	priceOverviews,
	packageGroups,
	subs,
	screenshots,
	movies,
	achievements,
	ratings,
	demos,
	metacritics,
} from '@/lib/db/schema'
import { db as drizzleDb } from '@/lib/db/index'
import { eq } from 'drizzle-orm'

const BATCH_SIZE = 1000

function safeParseDate(dateString: string | null | undefined): Date | null {
	if (!dateString) return null
	const parsedDate = new Date(dateString)
	return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

async function gameExists(steamAppid: number): Promise<boolean> {
	const existingGame = await drizzleDb.select().from(processedGames).where(eq(processedGames.steamAppid, steamAppid))
	return existingGame.length > 0
}

export async function POST(req: Request) {
	try {
		let processedCount = 0
		let skip = 0
		let hasMore = true

		while (hasMore) {
			const prismGames = await db.processedGame.findMany({
				take: BATCH_SIZE,
				skip: skip,
				include: {
					pcRequirements: true,
					linuxRequirements: true,
					macRequirements: true,
					supportInfo: true,
					contentDescriptors: true,
					priceOverview: true,
					packageGroups: {
						include: {
							subs: true,
						},
					},
					categories: true,
					genres: true,
					screenshots: true,
					movies: true,
					achievements: true,
					ratings: true,
					demos: true,
					metacritic: true,
					releaseDate: true,
				},
			})

			if (prismGames.length === 0) {
				hasMore = false
				break
			}

			for (const game of prismGames) {
				const steamAppid = Number(game.appId)
				const exists = await gameExists(steamAppid)

				if (!exists) {
					const [insertedGame] = await drizzleDb
						.insert(processedGames)
						.values({
							steamAppid: Number(game.appId),
							name: game.name,
							type: game.type ?? '',
							shortDescription: game.shortDescription,
							requiredAge: game.requiredAge,
							isFree: game.isFree,
							headerImage: game.headerImage,
							releaseDate: safeParseDate(game.releaseDate?.date),
							developers: game.developers ? JSON.parse(game.developers) : [],
							genres: game.genres.map((g) => g.description) ?? [],
							categories: game.categories.map((c) => c.description) ?? [],
							voteCount: 0,
							createdAt: game.createdAt,
							updatedAt: game.updatedAt,

							dlc: game.dlc,
							detailedDescription: game.detailedDescription,
							aboutTheGame: game.aboutTheGame,
							supportedLanguages: game.supportedLanguages,
							reviews: game.reviews ?? '',
							capsuleImage: game.capsuleImage,
							capsuleImagev5: game.capsuleImagev5,
							website: game.website ?? '',
							publishers: game.publishers ? JSON.parse(game.publishers) : [],
							recommendations: game.recommendations ?? 0,
							background: game.background,
							backgroundRaw: game.backgroundRaw,
							packages: game.packages,
							extUserAccountNotice: game.extUserAccountNotice ?? '',
							legalNotice: game.legalNotice ?? '',
							controllerSupport: game.controllerSupport ?? '',
							fullgame: game.fullgame ?? '',
							additionalData: game.additionalData ?? '',
						})
						.returning({ id: processedGames.id })

					if (insertedGame) {
						const gameId = insertedGame.id

						// PC Requirements
						if (game.pcRequirements !== null) {
							await drizzleDb.insert(pcRequirements).values({
								gameId,
								minimum: game.pcRequirements.minimum,
								recommended: game.pcRequirements.recommended,
							})
						}

						// Mac Requirements
						if (game.macRequirements !== null) {
							await drizzleDb.insert(macRequirements).values({
								gameId,
								minimum: game.macRequirements.minimum,
								recommended: game.macRequirements.recommended,
							})
						}

						// Linux Requirements
						if (game.linuxRequirements !== null) {
							await drizzleDb.insert(linuxRequirements).values({
								gameId,
								minimum: game.linuxRequirements.minimum,
								recommended: game.linuxRequirements.recommended,
							})
						}

						// Support Info
						if (game.supportInfo !== null) {
							await drizzleDb.insert(supportInfo).values({
								gameId,
								url: game.supportInfo.url,
								email: game.supportInfo.email,
							})
						}

						// Content Descriptors
						if (game.contentDescriptors !== null) {
							await drizzleDb.insert(contentDescriptors).values({
								gameId,
								ids: game.contentDescriptors.ids,
								notes: game.contentDescriptors.notes,
							})
						}

						// Price Overview
						if (game.priceOverview !== null) {
							await drizzleDb.insert(priceOverviews).values({
								gameId,
								currency: game.priceOverview.currency,
								initial: game.priceOverview.initial,
								final: game.priceOverview.final,
								discountPercent: game.priceOverview.discountPercent,
								initialFormatted: game.priceOverview.initialFormatted,
								finalFormatted: game.priceOverview.finalFormatted,
							})
						}

						// Package Groups and Subs
						if (game.packageGroups !== null && game.packageGroups.length > 0) {
							for (const pg of game.packageGroups) {
								const [insertedPackageGroup] = await drizzleDb
									.insert(packageGroups)
									.values({
										gameId,
										name: pg.name,
										title: pg.title,
										description: pg.description,
										selectionText: pg.selectionText,
										saveText: pg.saveText,
										displayType: pg.displayType,
										isRecurringSubscription: pg.isRecurringSubscription,
									})
									.returning({ id: packageGroups.id })

								if (insertedPackageGroup) {
									await drizzleDb.insert(subs).values(
										pg.subs.map((sub) => ({
											packageGroupId: insertedPackageGroup.id,
											packageid: sub.packageid,
											percentSavingsText: sub.percentSavingsText,
											percentSavings: sub.percentSavings,
											optionText: sub.optionText,
											optionDescription: sub.optionDescription,
											canGetFreeLicense: sub.canGetFreeLicense,
											isFreeLicense: sub.isFreeLicense,
											priceInCentsWithDiscount: sub.priceInCentsWithDiscount,
										})),
									)
								}
							}
						}

						// Screenshots
						if (game.screenshots !== null && game.screenshots.length > 0) {
							await drizzleDb.insert(screenshots).values(
								game.screenshots.map((s) => ({
									gameId,
									pathThumbnail: s.pathThumbnail,
									pathFull: s.pathFull,
								})),
							)
						}

						// Movies
						if (game.movies !== null && game.movies.length > 0) {
							await drizzleDb.insert(movies).values(
								game.movies.map((m) => ({
									gameId,
									name: m.name,
									thumbnail: m.thumbnail,
									webm: m.webm,
									mp4: m.mp4,
									highlight: m.highlight,
								})),
							)
						}

						// Achievements
						if (game.achievements !== null && game.achievements.length > 0) {
							await drizzleDb.insert(achievements).values(
								game.achievements.map((a) => ({
									gameId,
									name: a.name,
									path: a.path,
								})),
							)
						}

						// Ratings
						if (game.ratings !== null && game.ratings.length > 0) {
							await drizzleDb.insert(ratings).values(
								game.ratings.map((r) => ({
									gameId,
									source: r.source,
									ratingGenerated: r.ratingGenerated,
									rating: r.rating,
									requiredAge: r.requiredAge,
									banned: r.banned,
									useAgeGate: r.useAgeGate,
									descriptors: r.descriptors,
								})),
							)
						}

						// Demos
						if (game.demos !== null && game.demos.length > 0) {
							await drizzleDb.insert(demos).values(
								game.demos.map((d) => ({
									gameId,
									appid: d.appid,
									description: d.description,
								})),
							)
						}

						// Metacritic
						if (game.metacritic !== null) {
							if (game.metacritic) {
								await drizzleDb.insert(metacritics).values({
									gameId,
									url: game.metacritic.url,
									score: game.metacritic.score,
								})
							}
						}
					}
					processedCount++
				}
			}

			skip += BATCH_SIZE
		}

		return Response.json({ message: `Transferred ${processedCount} games to Drizzle` })
	} catch (error) {
		console.error('Error transferring games:', error)
		return Response.json({ error: 'Failed to transfer games' }, { status: 500 })
	}
}

import { pgTable, serial, text, integer, boolean, timestamp, varchar, index, uniqueIndex, foreignKey, vector } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { users } from './user'
import { voteType } from '@/constants/enums'

export const processedGames = pgTable(
	'processed_games',
	{
		id: serial('id').primaryKey(),
		steamAppid: integer('steam_appid'),
		name: varchar('name', { length: 255 }).notNull(),
		type: varchar('type', { length: 255 }).notNull(),
		shortDescription: text('short_description'),
		requiredAge: integer('required_age').notNull().default(0),
		isFree: boolean('is_free').notNull().default(false),
		headerImage: varchar('header_image', { length: 255 }),
		releaseDate: timestamp('release_date', { withTimezone: true }),
		developers: text('developers').array(),
		genres: text('genres').array(),
		categories: text('categories').array(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),

		voteCount: integer('vote_count').notNull().default(0),
		nsfw: boolean('nsfw').notNull().default(false),

		dlc: text('dlc'),
		detailedDescription: text('detailed_description'),
		aboutTheGame: text('about_the_game'),
		supportedLanguages: text('supported_languages'),
		reviews: text('reviews'),
		capsuleImage: varchar('capsule_image', { length: 255 }),
		capsuleImagev5: varchar('capsule_image_v5', { length: 255 }),
		website: varchar('website', { length: 255 }),
		publishers: text('publishers').array(),
		recommendations: integer('recommendations'),
		background: varchar('background', { length: 255 }),
		backgroundRaw: varchar('background_raw', { length: 255 }),
		packages: text('packages'),
		extUserAccountNotice: text('ext_user_account_notice'),
		legalNotice: text('legal_notice'),
		controllerSupport: varchar('controller_support', { length: 255 }),
		fullgame: text('fullgame'),
		additionalData: text('additional_data'),

		embedding: vector('embedding', { dimensions: 3072 }),
		noEmbedding: boolean('no_embedding').notNull().default(false),
	},
	(table) => ({
		steamAppIdIdx: uniqueIndex('steam_appid_idx').on(table.steamAppid),
		mainQueryIdx: index('main_query_idx').on(table.type, table.voteCount, table.name, table.releaseDate),
		genreCategoryIdx: index('genre_category_idx').on(table.genres, table.categories),
		searchVectorIdx: index('search_vector_idx').using(
			'gin',
			sql`(
                setweight(to_tsvector('english', ${table.name}), 'A') ||
                setweight(to_tsvector('english', ${table.shortDescription}), 'B')
            )`,
		),
		releaseDateIdx: index('release_date_idx').on(table.releaseDate),
		nameIdx: index('name_idx').on(table.name),
	}),
)

export const supportInfo = pgTable(
	'support_info',
	{
		id: serial('id').primaryKey(),
		gameId: integer('game_id').notNull().unique(),
		url: varchar('url', { length: 255 }),
		email: varchar('email', { length: 255 }),
	},
	(table) => ({
		gameIdIdx: uniqueIndex('support_info_game_id_idx').on(table.gameId),
		gameIdFk: foreignKey({
			columns: [table.gameId],
			foreignColumns: [processedGames.id],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
	}),
)

export const contentDescriptors = pgTable(
	'content_descriptors',
	{
		id: serial('id').primaryKey(),
		gameId: integer('game_id').notNull().unique(),
		ids: text('ids').notNull(),
		notes: text('notes'),
	},
	(table) => ({
		gameIdIdx: uniqueIndex('content_descriptors_game_id_idx').on(table.gameId),
		gameIdFk: foreignKey({
			columns: [table.gameId],
			foreignColumns: [processedGames.id],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
	}),
)

export const priceOverviews = pgTable(
	'price_overviews',
	{
		id: serial('id').primaryKey(),
		gameId: integer('game_id').notNull().unique(),
		currency: varchar('currency', { length: 10 }).notNull(),
		initial: integer('initial').notNull(),
		final: integer('final').notNull(),
		discountPercent: integer('discount_percent').notNull(),
		initialFormatted: varchar('initial_formatted', { length: 255 }).notNull(),
		finalFormatted: varchar('final_formatted', { length: 255 }).notNull(),
	},
	(table) => ({
		gameIdIdx: uniqueIndex('price_overview_game_id_idx').on(table.gameId),
		gameIdFk: foreignKey({
			columns: [table.gameId],
			foreignColumns: [processedGames.id],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
	}),
)

export const packageGroups = pgTable(
	'package_groups',
	{
		id: serial('id').primaryKey(),
		gameId: integer('game_id').notNull(),
		name: varchar('name', { length: 255 }).notNull(),
		title: varchar('title', { length: 255 }).notNull(),
		description: text('description'),
		selectionText: text('selection_text').notNull(),
		saveText: text('save_text'),
		displayType: integer('display_type').notNull(),
		isRecurringSubscription: varchar('is_recurring_subscription', { length: 255 }).notNull(),
	},
	(table) => ({
		gameIdIdx: index('package_group_game_id_idx').on(table.gameId),
		gameIdFk: foreignKey({
			columns: [table.gameId],
			foreignColumns: [processedGames.id],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
	}),
)

export const subs = pgTable(
	'subs',
	{
		id: serial('id').primaryKey(),
		packageGroupId: integer('package_group_id').notNull(),
		packageid: integer('package_id').notNull(),
		percentSavingsText: varchar('percent_savings_text', { length: 255 }),
		percentSavings: integer('percent_savings').notNull(),
		optionText: varchar('option_text', { length: 255 }).notNull(),
		optionDescription: text('option_description'),
		canGetFreeLicense: varchar('can_get_free_license', { length: 255 }).notNull(),
		isFreeLicense: boolean('is_free_license').notNull(),
		priceInCentsWithDiscount: integer('price_in_cents_with_discount').notNull(),
	},
	(table) => ({
		packageGroupIdIdx: index('sub_package_group_id_idx').on(table.packageGroupId),
		packageGroupIdFk: foreignKey({
			columns: [table.packageGroupId],
			foreignColumns: [packageGroups.id],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
	}),
)

export const screenshots = pgTable(
	'screenshots',
	{
		id: serial('id').primaryKey(),
		gameId: integer('game_id').notNull(),
		pathThumbnail: varchar('path_thumbnail', { length: 255 }).notNull(),
		pathFull: varchar('path_full', { length: 255 }).notNull(),
	},
	(table) => ({
		gameIdIdIdx: uniqueIndex('screenshot_game_id_id_idx').on(table.gameId, table.id),
		gameIdFk: foreignKey({
			columns: [table.gameId],
			foreignColumns: [processedGames.id],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
	}),
)

export const movies = pgTable(
	'movies',
	{
		id: serial('id').primaryKey(),
		gameId: integer('game_id').notNull(),
		name: varchar('name', { length: 255 }).notNull(),
		thumbnail: varchar('thumbnail', { length: 255 }).notNull(),
		webm: varchar('webm', { length: 255 }).notNull(),
		mp4: varchar('mp4', { length: 255 }).notNull(),
		highlight: boolean('highlight').notNull(),
	},
	(table) => ({
		gameIdIdIdx: uniqueIndex('movie_game_id_id_idx').on(table.gameId, table.id),
		gameIdFk: foreignKey({
			columns: [table.gameId],
			foreignColumns: [processedGames.id],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
	}),
)

export const achievements = pgTable(
	'achievements',
	{
		id: serial('id').primaryKey(),
		gameId: integer('game_id').notNull(),
		name: varchar('name', { length: 255 }).notNull(),
		path: varchar('path', { length: 255 }).notNull(),
	},
	(table) => ({
		gameIdIdx: index('achievement_game_id_idx').on(table.gameId),
		gameIdFk: foreignKey({
			columns: [table.gameId],
			foreignColumns: [processedGames.id],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
	}),
)

export const ratings = pgTable(
	'ratings',
	{
		id: serial('id').primaryKey(),
		gameId: integer('game_id').notNull(),
		source: varchar('source', { length: 255 }).notNull(),
		ratingGenerated: varchar('rating_generated', { length: 255 }).notNull(),
		rating: varchar('rating', { length: 255 }).notNull(),
		requiredAge: varchar('required_age', { length: 255 }).notNull(),
		banned: varchar('banned', { length: 255 }).notNull(),
		useAgeGate: varchar('use_age_gate', { length: 255 }).notNull(),
		descriptors: text('descriptors'),
	},
	(table) => ({
		gameIdSourceIdx: uniqueIndex('rating_game_id_source_idx').on(table.gameId, table.source),
		gameIdFk: foreignKey({
			columns: [table.gameId],
			foreignColumns: [processedGames.id],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
	}),
)

export const demos = pgTable(
	'demos',
	{
		id: serial('id').primaryKey(),
		gameId: integer('game_id').notNull(),
		appid: integer('appid').notNull(),
		description: text('description'),
	},
	(table) => ({
		gameIdAppidIdx: uniqueIndex('demo_game_id_appid_idx').on(table.gameId, table.appid),
		gameIdFk: foreignKey({
			columns: [table.gameId],
			foreignColumns: [processedGames.id],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
	}),
)

export const metacritics = pgTable(
	'metacritics',
	{
		id: serial('id').primaryKey(),
		gameId: integer('game_id').notNull().unique(),
		url: varchar('url', { length: 255 }),
		score: integer('score'),
	},
	(table) => ({
		gameIdIdx: uniqueIndex('metacritic_game_id_idx').on(table.gameId),
		gameIdFk: foreignKey({
			columns: [table.gameId],
			foreignColumns: [processedGames.id],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
	}),
)

// Game Votes
export const gameVotes = pgTable(
	'game_votes',
	{
		id: serial('id').primaryKey(),
		gameId: integer('game_id').notNull(),
		userId: text('user_id').notNull(),
		voteType: voteType('vote_type'),
	},
	(table) => ({
		gameUserIdx: uniqueIndex('vote_game_user_idx').on(table.gameId, table.userId),
		gameIdFk: foreignKey({
			columns: [table.gameId],
			foreignColumns: [processedGames.id],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
		userIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
	}),
)

// genres and categories
export const gameGenres = pgTable(
	'game_genres',
	{
		id: serial('id').primaryKey(),
		genre: varchar('genre', { length: 255 }).notNull(),
		gameCount: integer('game_count').notNull(),
		isEnglish: boolean('is_english').notNull().default(false),
	},
	(table) => ({
		genreIdx: uniqueIndex('genre_idx').on(table.genre),
	}),
)

export const gameCategories = pgTable(
	'game_categories',
	{
		id: serial('id').primaryKey(),
		category: varchar('category', { length: 255 }).notNull(),
		gameCount: integer('game_count').notNull(),
		isEnglish: boolean('is_english').notNull().default(false),
	},
	(table) => ({
		categoryIdx: uniqueIndex('category_idx').on(table.category),
	}),
)

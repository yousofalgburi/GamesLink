import { pgTable, serial, text, integer, boolean, timestamp, pgEnum, varchar, index, uniqueIndex, foreignKey, primaryKey } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import type { AdapterAccount } from 'next-auth/adapters'

// USER
export const users = pgTable('user', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text('name'),
	username: text('username').unique(),
	email: text('email').unique(),
	emailVerified: timestamp('emailVerified', { mode: 'date' }),
	image: text('image'),
})

export const accounts = pgTable(
	'account',
	{
		userId: text('userId')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		type: text('type').$type<AdapterAccount['type']>().notNull(),
		provider: text('provider').notNull(),
		providerAccountId: text('providerAccountId').notNull(),
		refresh_token: text('refresh_token'),
		access_token: text('access_token'),
		expires_at: integer('expires_at'),
		token_type: text('token_type'),
		scope: text('scope'),
		id_token: text('id_token'),
		session_state: text('session_state'),
	},
	(account) => ({
		compoundKey: primaryKey({
			columns: [account.provider, account.providerAccountId],
		}),
	}),
)

export const sessions = pgTable('session', {
	sessionToken: text('sessionToken').primaryKey(),
	userId: text('userId')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
	'verificationToken',
	{
		identifier: text('identifier').notNull(),
		token: text('token').notNull(),
		expires: timestamp('expires', { mode: 'date' }).notNull(),
	},
	(verificationToken) => ({
		compositePk: primaryKey({
			columns: [verificationToken.identifier, verificationToken.token],
		}),
	}),
)

export const authenticators = pgTable(
	'authenticator',
	{
		credentialID: text('credentialID').notNull().unique(),
		userId: text('userId')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		providerAccountId: text('providerAccountId').notNull(),
		credentialPublicKey: text('credentialPublicKey').notNull(),
		counter: integer('counter').notNull(),
		credentialDeviceType: text('credentialDeviceType').notNull(),
		credentialBackedUp: boolean('credentialBackedUp').notNull(),
		transports: text('transports'),
	},
	(authenticator) => ({
		compositePK: primaryKey({
			columns: [authenticator.userId, authenticator.credentialID],
		}),
	}),
)

// GAME
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
		voteCount: integer('vote_count').notNull().default(0),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),

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
	},
	(table) => ({
		nameIdx: index('name_idx').on(table.name),
		typeIdx: index('type_idx').on(table.type),
		isFreeIdx: index('is_free_idx').on(table.isFree),
		voteCountIdx: index('vote_count_idx').on(table.voteCount),
		genresIdx: index('genres_idx').on(table.genres),
		categoriesIdx: index('categories_idx').on(table.categories),
		releaseDateIdx: index('release_date_idx').on(table.releaseDate),
		steamAppIdIdx: uniqueIndex('steam_appid_idx').on(table.steamAppid),
		typeVoteCountIdIdx: index('type_vote_count_id_idx').on(table.type, table.voteCount, table.id),
		isFreeTypeVoteCountIdx: index('is_free_type_vote_count_idx').on(table.isFree, table.type, table.voteCount),
		requiredAgeTypeVoteCountIdx: index('required_age_type_vote_count_idx').on(table.requiredAge, table.type, table.voteCount),
		searchVectorIdx: index('search_vector_idx').using(
			'gin',
			sql`(
              setweight(to_tsvector('english', ${table.name}), 'A') ||
              setweight(to_tsvector('english', ${table.shortDescription}), 'B')
            )`,
		),

		typeNameIdx: index('type_name_idx').on(table.type, table.name),
		typeShortDescriptionIdx: index('type_short_description_idx').on(table.type, table.shortDescription),
		createdAtTypeVoteCountIdx: index('created_at_type_vote_count_idx').on(table.createdAt, table.type, table.voteCount),
		updatedAtTypeVoteCountIdx: index('updated_at_type_vote_count_idx').on(table.updatedAt, table.type, table.voteCount),
	}),
)

export const voteType = pgEnum('vote_type', ['UP', 'DOWN'])

export const gameVotes = pgTable(
	'game_votes',
	{
		id: serial('id').primaryKey(),
		gameId: integer('game_id').notNull().unique(),
		userId: text('user_id').notNull(),
		voteType: voteType('vote_type'),
	},
	(table) => ({
		gameIdIdx: uniqueIndex('vote_game_id_idx').on(table.gameId),
		gameIdFk: foreignKey({
			columns: [table.gameId],
			foreignColumns: [processedGames.id],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
		gameIdUserFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
	}),
)

export const pcRequirements = pgTable(
	'pc_requirements',
	{
		id: serial('id').primaryKey(),
		gameId: integer('game_id').notNull().unique(),
		minimum: text('minimum').notNull(),
		recommended: text('recommended'),
	},
	(table) => ({
		gameIdIdx: uniqueIndex('pc_req_game_id_idx').on(table.gameId),
		gameIdFk: foreignKey({
			columns: [table.gameId],
			foreignColumns: [processedGames.id],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
	}),
)

export const macRequirements = pgTable(
	'mac_requirements',
	{
		id: serial('id').primaryKey(),
		gameId: integer('game_id').notNull().unique(),
		minimum: text('minimum').notNull(),
		recommended: text('recommended'),
	},
	(table) => ({
		gameIdIdx: uniqueIndex('mac_req_game_id_idx').on(table.gameId),
		gameIdFk: foreignKey({
			columns: [table.gameId],
			foreignColumns: [processedGames.id],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
	}),
)

export const linuxRequirements = pgTable(
	'linux_requirements',
	{
		id: serial('id').primaryKey(),
		gameId: integer('game_id').notNull().unique(),
		minimum: text('minimum').notNull(),
		recommended: text('recommended'),
	},
	(table) => ({
		gameIdIdx: uniqueIndex('linux_req_game_id_idx').on(table.gameId),
		gameIdFk: foreignKey({
			columns: [table.gameId],
			foreignColumns: [processedGames.id],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
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

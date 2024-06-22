import { boolean, timestamp, pgTable, text, primaryKey, integer, serial, varchar } from 'drizzle-orm/pg-core'
import { nanoid } from 'nanoid'
import type { AdapterAccount } from 'next-auth/adapters'

export const users = pgTable('user', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text('name').notNull(),
	email: text('email').notNull(),
	emailVerified: timestamp('emailVerified', { mode: 'date' }),
	username: text('username').notNull(),
	credits: integer('credits').notNull().default(0),
	image: text('image'),
})

export const accounts = pgTable(
	'account',
	{
		userId: text('userId')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		type: text('type').$type<AdapterAccount>().notNull(),
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

export const SteamGame = pgTable('SteamGame', {
	id: serial('id').primaryKey(),
	steamAppId: text('steamAppId').unique(),
	name: varchar('name'),
	shortDescription: varchar('shortDescription'),
	headerImage: varchar('headerImage'),
	requiredAge: integer('requiredAge'),
	isFree: boolean('isFree'),
	releaseDate: timestamp('releaseDate', { mode: 'date' }).notNull(),
	developers: text('developers'),
	categories: text('categories'),
	genres: text('genres'),
	voteCount: integer('voteCount').default(0),
})

export const Vote = pgTable('Vote', {
	userId: text('userId').references(() => users.id),
	gameId: integer('gameId').references(() => SteamGame.id, { onDelete: 'cascade' }),
	type: text('type'),
})

export const Comment = pgTable('Comment', {
	id: text('id').primaryKey().default(nanoid()),
	text: text('text'),
	createdAt: timestamp('createdAt').default(new Date()),
	authorId: text('authorId').references(() => users.id),
	gameId: integer('gameId').references(() => SteamGame.id, { onDelete: 'cascade' }),
	replyToId: text('replyToId'),
	voteCount: integer('voteCount').default(0),
	commentId: text('commentId'),
})

export const CommentVote = pgTable('CommentVote', {
	userId: text('userId').references(() => users.id),
	commentId: text('commentId').references(() => Comment.id, { onDelete: 'cascade' }),
	type: text('type'),
})

export const FriendRequest = pgTable('FriendRequest', {
	id: text('id').primaryKey().default(nanoid()),
	fromUserId: text('fromUserId').references(() => users.id),
	toUserId: text('toUserId').references(() => users.id),
	status: text('status').default('PENDING'),
	createdAt: timestamp('createdAt').default(new Date()),
})

export const Friendship = pgTable('Friendship', {
	id: text('id').primaryKey().default(nanoid()),
	userId: text('userId'),
	friendId: text('friendId'),
})

export const Room = pgTable('Room', {
	id: text('id').primaryKey().default(nanoid()),
	hostId: text('hostId'),
	roomId: text('roomId').unique(),
	isActive: boolean('isActive').default(true),
	isPublic: boolean('isPublic').default(true),
	queuedUsers: text('queuedUsers'),
	allowedUsers: text('allowedUsers'),
	createdAt: timestamp('createdAt').default(new Date()),
})

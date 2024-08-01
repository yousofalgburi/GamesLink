import { pgTable, text, timestamp, foreignKey, uniqueIndex } from 'drizzle-orm/pg-core'
import { users } from './user'

export const friendRequests = pgTable(
	'friend_requests',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		fromUserId: text('from_user_id').notNull(),
		toUserId: text('to_user_id').notNull(),
		status: text('status').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => ({
		fromUserFk: foreignKey({
			columns: [table.fromUserId],
			foreignColumns: [users.id],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
		toUserFk: foreignKey({
			columns: [table.toUserId],
			foreignColumns: [users.id],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
		createdAtIdx: uniqueIndex('friend_request_created_at_idx').on(table.createdAt),
	}),
)

export const friendships = pgTable(
	'friendships',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text('user_id').notNull(),
		friendId: text('friend_id').notNull(),
	},
	(table) => ({
		userFriendUnique: uniqueIndex('user_friend_unique_idx').on(table.userId, table.friendId),
		friendIdIdx: uniqueIndex('friend_id_idx').on(table.friendId),
		userFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
		friendFk: foreignKey({
			columns: [table.friendId],
			foreignColumns: [users.id],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
	}),
)

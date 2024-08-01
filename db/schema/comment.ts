import { pgTable, text, integer, timestamp, foreignKey, uniqueIndex, primaryKey } from 'drizzle-orm/pg-core'
import { users } from './user'
import { processedGames } from './game'
import { voteType } from '@/constants/enums'

export const comments = pgTable(
	'comments',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		text: text('text').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		authorId: text('author_id').notNull(),
		gameId: integer('game_id').notNull(),
		replyToId: text('reply_to_id'),
		voteCount: integer('vote_count').notNull().default(0),
	},
	(table) => ({
		authorFk: foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
		gameFk: foreignKey({
			columns: [table.gameId],
			foreignColumns: [processedGames.id],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
		replyToFk: foreignKey({
			columns: [table.replyToId],
			foreignColumns: [table.id],
		})
			.onDelete('set null')
			.onUpdate('cascade'),
		createdAtIdx: uniqueIndex('comment_created_at_idx').on(table.createdAt),
	}),
)

export const commentVotes = pgTable(
	'comment_votes',
	{
		userId: text('user_id').notNull(),
		commentId: text('comment_id').notNull(),
		type: voteType('vote_type').notNull(),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.userId, table.commentId] }),
		userFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
		commentFk: foreignKey({
			columns: [table.commentId],
			foreignColumns: [comments.id],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
	}),
)

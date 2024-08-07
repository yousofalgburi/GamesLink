import { pgTable, text, boolean, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './user'

export const rooms = pgTable(
	'rooms',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		hostId: text('host_id').notNull(),
		roomId: text('room_id').notNull().unique(),
		isActive: boolean('is_active').notNull().default(true),
		isPublic: boolean('is_public').notNull().default(true),
		queuedUsers: text('queued_users').array(),
		allowedUsers: text('allowed_users').array(),
		members: text('members').array(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => ({
		roomIdIdx: uniqueIndex('room_id_idx').on(table.roomId),
	}),
)

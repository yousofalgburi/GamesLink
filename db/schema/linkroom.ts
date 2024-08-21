import { pgTable, text, boolean, timestamp, uniqueIndex, integer, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import type { ExtendedGame } from '@/types/db'

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

export const rollResults = pgTable(
	'roll_results',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		roomId: text('room_id').notNull(),
		rollNumber: integer('roll_number').notNull(),
		games: jsonb('games').$type<ExtendedGame[]>().notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => ({
		roomIdIdx: uniqueIndex('room_id_roll_number_idx').on(table.roomId, table.rollNumber),
	}),
)

export const roomsRelations = relations(rooms, ({ many }) => ({
	rollResults: many(rollResults),
}))

export const rollResultsRelations = relations(rollResults, ({ one }) => ({
	room: one(rooms, {
		fields: [rollResults.roomId],
		references: [rooms.id],
	}),
}))

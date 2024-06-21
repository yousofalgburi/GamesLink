import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const userTable = pgTable('user', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	password: text('password').notNull(),
})

export type InsertUser = typeof userTable.$inferInsert
export type SelectUser = typeof userTable.$inferSelect

export const sessionTable = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => userTable.id),
	expiresAt: timestamp('expires_at', {
		withTimezone: true,
		mode: 'date',
	}).notNull(),
})

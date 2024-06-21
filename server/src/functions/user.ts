import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { type InsertUser, type SelectUser, userTable } from '../db/schema'
import { eq } from 'drizzle-orm'

export async function getUser(db: PostgresJsDatabase, email: string): Promise<SelectUser | null> {
	const result = await db.select().from(userTable).where(eq(userTable.email, email))
	if (!result || result.length === 0) {
		return null
	}

	return result[0]
}

export async function insertUser(db: PostgresJsDatabase, data: InsertUser): Promise<SelectUser | null> {
	const result = await db.insert(userTable).values(data).returning()
	if (!result || result.length === 0) {
		return null
	}

	return result[0]
}

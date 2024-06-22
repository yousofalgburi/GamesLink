import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

export const db = (url: string) => drizzle(postgres(url, { prepare: false }))

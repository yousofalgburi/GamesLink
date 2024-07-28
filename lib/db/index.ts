import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL

const getProductionConnection = () => {
	const sql = postgres(connectionString, { max: 10 })
	return drizzle(sql)
}

const getDevelopmentConnection = () => {
	const sql = postgres(connectionString, { max: 1 })
	return drizzle(sql)
}

export const db = process.env.NODE_ENV === 'production' ? getProductionConnection() : getDevelopmentConnection()

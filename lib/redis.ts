import { createClient, type RedisClientType } from 'redis'

let redisClient: RedisClientType | null = null

export async function getRedisClient(): Promise<RedisClientType> {
	if (!redisClient) {
		redisClient = createClient({
			url: process.env.REDIS_URL,
		})

		redisClient.on('error', (error) => {
			console.error('Redis Client Error:', error)
		})

		await redisClient.connect()
	}

	return redisClient
}

export async function closeRedisConnection(): Promise<void> {
	if (redisClient) {
		await redisClient.quit()
		redisClient = null
	}
}

export async function withRedis<T>(operation: (client: RedisClientType) => Promise<T>): Promise<T> {
	const client = await getRedisClient()
	try {
		return await operation(client)
	} catch (error: unknown) {
		if (error instanceof Error && (error.message.includes('ECONNREFUSED') || error.message.includes('Connection timeout'))) {
			console.warn('Redis connection lost. Attempting to reconnect...')
			await closeRedisConnection()
			const newClient = await getRedisClient()
			return await operation(newClient)
		}
		throw error
	}
}

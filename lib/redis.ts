import { createClient } from 'redis'

let redis: ReturnType<typeof createClient> | null = null

export async function getRedisClient() {
	if (!redis || !redis.isOpen) {
		redis = createClient({
			url: process.env.REDIS_URL,
		})
		redis.on('error', (error) => {
			console.error('Redis Client Error:', error)
		})
		await redis.connect()
	}
	return redis
}

export async function closeRedisConnection() {
	if (redis?.isOpen) {
		await redis.quit()
		redis = null
	}
}

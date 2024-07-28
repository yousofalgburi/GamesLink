import { createClient } from 'redis'

let redis: ReturnType<typeof createClient> | null = null

export async function getRedisClient() {
	if (!redis) {
		redis = createClient({
			url: process.env.REDIS_URL,
		})
		redis.on('error', (err) => console.log('Redis Client Error', err))
		await redis.connect()
	}
	return redis
}

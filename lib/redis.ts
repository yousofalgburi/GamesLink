import { createClient, type RedisClientType } from 'redis'

class Redis {
	private static instance: Redis
	private client: RedisClientType | null = null

	private constructor() {}

	public static getInstance(): Redis {
		if (!Redis.instance) {
			Redis.instance = new Redis()
		}
		return Redis.instance
	}

	private async getClient(): Promise<RedisClientType> {
		if (!this.client) {
			this.client = createClient({
				url: process.env.REDIS_URL,
			})

			this.client.on('error', (error) => {
				console.error('Redis Client Error:', error)
			})

			await this.client.connect()
		}

		return this.client
	}

	public async closeConnection(): Promise<void> {
		if (this.client) {
			await this.client.quit()
			this.client = null
		}
	}

	private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
		try {
			return await operation()
		} catch (error: unknown) {
			if (error instanceof Error && (error.message.includes('ECONNREFUSED') || error.message.includes('Connection timeout'))) {
				console.warn('Redis connection lost. Attempting to reconnect...')
				await this.closeConnection()
				this.client = null
				return await operation()
			}
			throw error
		}
	}

	public async get(key: string): Promise<string | null> {
		return this.withRetry(async () => {
			const client = await this.getClient()
			return client.get(key)
		})
	}

	public async set(key: string, value: string): Promise<void> {
		await this.withRetry(async () => {
			const client = await this.getClient()
			await client.set(key, value)
		})
	}

	public async expire(key: string, seconds: number): Promise<void> {
		await this.withRetry(async () => {
			const client = await this.getClient()
			await client.expire(key, seconds)
		})
	}

	public async incr(key: string): Promise<number> {
		return this.withRetry(async () => {
			const client = await this.getClient()
			return client.incr(key)
		})
	}
}

export const redis = Redis.getInstance()

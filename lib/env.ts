import { z } from 'zod'

const envVariables = z.object({
	NODE_ENV: z.string(),
	DATABASE_URL: z.string(),
	OPENAI_API_KEY: z.string(),
	PRIVATE_API_TOKEN: z.string(),
	REAL_TIME_API_URL: z.string(),
	REDIS_URL: z.string(),
	AUTH_SECRET: z.string(),
	AUTH_HOST: z.string(),
	AUTH_GOOGLE_ID: z.string(),
	AUTH_GOOGLE_SECRET: z.string(),
})

envVariables.parse(process.env)

declare global {
	namespace NodeJS {
		interface ProcessEnv extends z.infer<typeof envVariables> {}
	}
}

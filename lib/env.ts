import { z } from 'zod'

const envVariables = z.object({
	NODE_ENV: z.string(),
	DATABASE_URL: z.string(),
	NEXTAUTH_SECRET: z.string(),
	NEXTAUTH_URL: z.string(),
	GOOGLE_CLIENT_ID: z.string(),
	GOOGLE_CLIENT_SECRET: z.string(),
	OPENAI_API_KEY: z.string(),
	PINECONE_API_KEY: z.string(),
	REDIS_URL: z.string(),
	REDIS_SECRET: z.string(),
})

envVariables.parse(process.env)

declare global {
	namespace NodeJS {
		interface ProcessEnv extends z.infer<typeof envVariables> {}
	}
}

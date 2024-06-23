/**
 * Welcome to Cloudflare Workers!
 *
 * This is a template for a Scheduled Worker: a Worker that can run on a
 * configurable interval:
 * https://developers.cloudflare.com/workers/platform/triggers/cron-triggers/
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"` to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { nanoid } from 'nanoid'

export default {
	async scheduled(event, env, ctx): Promise<void> {
		const db = new PrismaClient({
			datasources: {
				db: {
					url: env.DATABASE_URL,
				},
			},
		}).$extends(withAccelerate())

		await db.game.create({
			data: {
				appId: nanoid(10),
				name: 'test',
				loaded: false,
				loadedDate: new Date(),
			},
		})

		console.log('trigger fired')
	},
}

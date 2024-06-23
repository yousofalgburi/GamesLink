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

export default {
	async scheduled(event, env, ctx): Promise<void> {
		const db = new PrismaClient({
			datasources: {
				db: {
					url: env.DATABASE_URL,
				},
			},
		}).$extends(withAccelerate())

		const response = await fetch('https://api.steampowered.com/ISteamApps/GetAppList/v2')
		const data = await response.json()
		const apps = data.applist.apps

		const existingAppIds = await db.game.findMany({
			select: {
				appId: true,
			},
		})
		const existingAppIdSet = new Set(existingAppIds.map((app) => app.appId))

		const newApps = apps
			.filter((app) => !existingAppIdSet.has(app.appid.toString()))
			.map((app) => ({
				appId: app.appid.toString(),
				name: app.name || '',
				loaded: false,
				loadedDate: new Date(),
			}))

		if (newApps.length > 0) {
			await db.game.createMany({
				data: newApps,
				skipDuplicates: true,
			})
		}

		console.log('Successfully synced games')
	},
}

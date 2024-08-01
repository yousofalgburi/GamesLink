import type { Game } from '@prisma/client'

export async function POST(req, res) {
	// const response = await fetch('https://api.steampowered.com/ISteamApps/GetAppList/v2')
	// const data = await response.json()
	// const apps = data.applist.apps

	// const existingAppIds = await db.game.findMany({
	// 	select: {
	// 		appId: true,
	// 	},
	// })
	// const existingAppIdSet = new Set(existingAppIds.map((app) => app.appId))
	// const newApps: Game[] = []
	// const maxGames = 10000
	// let currentGames = 0

	// for (const app of apps) {
	// 	if (!existingAppIdSet.has(app.appid.toString())) {
	// 		newApps.push({
	// 			appId: app.appid.toString(),
	// 			name: app.name || '',
	// 			loaded: false,
	// 			loadedDate: null,
	// 			createdAt: new Date(),
	// 		})
	// 		currentGames++

	// 		if (currentGames >= maxGames) {
	// 			break
	// 		}
	// 	}
	// }

	// await db.game.createMany({
	// 	data: newApps,
	// })

	// console.log('Successfully synced games')

	return Response.json({ message: 'Synced 0 games' })
}

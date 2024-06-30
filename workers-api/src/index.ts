import { syncGames } from '../functions/syncGames'
import { processGames } from '../functions/processGames'

export default {
	async scheduled(controller, env: Env, ctx): Promise<void> {
		switch (controller.cron) {
			case '0 0 * * *':
				await syncGames(env)
				break
			case '* * * * *':
				await processGames(env)
				break
		}
		console.log('Cron job completed')
	},
}

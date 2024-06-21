import type { ApiRoutes } from '@server/src/index'
import { hc } from 'hono/client'

export const client = hc<ApiRoutes>(process.env.API_URL ?? 'http://127.0.0.1:8787')

export const api = client.api

export async function getCurrentUser() {
	const res = await fetch(api.auth.me.$url(), {
		credentials: 'include',
	})

	if (!res.ok) {
		throw new Error('server error')
	}
	const data = await res.json()
	return data
}

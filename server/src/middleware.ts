import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'

import { initializeLucia } from './db/lucia'

export async function authMiddleware(c: Context, next: Next) {
	const lucia = initializeLucia(c.env.DB_URL)
	const sessionId = getCookie(c, lucia.sessionCookieName) ?? null
	if (!sessionId) {
		c.set('user', null)
		c.set('session', null)
		return next()
	}

	const { session, user } = await lucia.validateSession(sessionId)
	session?.fresh &&
		c.header('Set-Cookie', lucia.createSessionCookie(session.id).serialize(), {
			append: true,
		})

	if (!session) {
		c.header('Set-Cookie', lucia.createBlankSessionCookie().serialize(), {
			append: true,
		})
	}

	c.set('user', user)
	c.set('session', session)

	return next()
}

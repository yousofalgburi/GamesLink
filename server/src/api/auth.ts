import { z } from 'zod'
import { Hono } from 'hono'
import { Scrypt, generateIdFromEntropySize } from 'lucia'
import { zValidator } from '@hono/zod-validator'
import type { Bindings, Variables } from '../bindings'
import { getUser, insertUser } from '../functions/user'
import { initializeLucia } from '../db/lucia'
import { db } from '../db/db'

export const authRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>()
	.post(
		'/login',
		zValidator(
			'json',
			z.object({
				email: z.string().min(1).email(),
				password: z.string().min(1).max(255),
			}),
		),
		async (c) => {
			const { email, password } = await c.req.valid('json')

			const user = await getUser(db(c.env.DB_URL), email)
			if (!user) {
				return c.json({ error: 'Invalid email or password.' }, 400)
			}

			const validPassword = await new Scrypt().verify(user.password, password)
			if (!validPassword) {
				return c.json({ error: 'Invalid email or password.' }, 400)
			}

			const lucia = initializeLucia(c.env.DB_URL)
			const session = await lucia.createSession(user.id, {})
			const cookie = lucia.createSessionCookie(session.id)

			c.header('Set-Cookie', cookie.serialize(), { append: true })

			return c.json({ message: 'Login successful' }, 201)
		},
	)
	.post(
		'/signup',
		zValidator(
			'json',
			z.object({
				email: z.string().min(1).email(),
				password: z.string().min(1).max(255),
			}),
		),
		async (c) => {
			const { email, password } = await c.req.valid('json')

			const existingUser = await getUser(db(c.env.DB_URL), email)
			if (existingUser) {
				return c.json({ error: 'User with that email already exists.' }, 400)
			}

			const passwordHash = await new Scrypt().hash(password)

			const user = await insertUser(db(c.env.DB_URL), {
				id: generateIdFromEntropySize(10),
				email,
				password: passwordHash,
			})
			if (!user) {
				return c.json({ error: 'An error occurred during sign up.' }, 500)
			}

			const lucia = initializeLucia(c.env.DB_URL)
			const session = await lucia.createSession(user.id, {})
			const cookie = lucia.createSessionCookie(session.id)

			c.header('Set-Cookie', cookie.serialize(), { append: true })

			return c.json({ message: 'Signup successful' }, 201)
		},
	)
	.post('/logout', async (c) => {
		const lucia = initializeLucia(c.env.DB_URL)
		const session = c.get('session')
		if (session) {
			await lucia.invalidateSession(session.id)
		}

		const cookie = lucia.createBlankSessionCookie()

		c.header('Set-Cookie', cookie.serialize(), { append: true })

		return c.redirect('/')
	})
	.get('/me', async (c) => {
		const user = c.var.user
		return c.json({ user })
	})

import { Hono } from 'hono'
import { csrf } from 'hono/csrf'
import type { Variables, Bindings } from './bindings'
import { cors } from 'hono/cors'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.use(csrf({ origin: 'http://localhost:3000' }))
app.use(
	'*',
	cors({
		origin: 'http://localhost:3000',
		allowHeaders: ['Content-Type', 'Authorization'],
		allowMethods: ['POST', 'GET', 'OPTIONS'],
		exposeHeaders: ['Content-Length'],
		maxAge: 600,
		credentials: true,
	}),
)
app.options('*', (c) => {
	return c.text('', 204)
})

const apiRoutes = app.basePath('/api')

export default app
export type ApiRoutes = typeof apiRoutes

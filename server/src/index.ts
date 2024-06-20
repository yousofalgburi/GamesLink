import { Hono } from 'hono'
import { csrf } from 'hono/csrf'
import { Variables, Bindings } from './bindings'
import { authMiddleware } from './middleware'
import api from './api'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.use(csrf())
app.use('*', authMiddleware)

app.route('/api', api)

export default app
export type ApiRoutes = typeof app

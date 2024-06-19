import { Hono } from 'hono'
import { D1Database } from '@cloudflare/workers-types'
import { testRoutes } from './testRoutes'

export type Env = {
    DB: D1Database
}

const app = new Hono<{ Bindings: Env }>()

const apiRoutes = app.basePath('/api').route('test', testRoutes)

export default app
export type ApiRoutes = typeof apiRoutes

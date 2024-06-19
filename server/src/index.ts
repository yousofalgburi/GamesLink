import { Hono } from 'hono'
import { testRoutes } from './testRoutes'

export type Env = {
    DB_URL: string
}

const app = new Hono<{ Bindings: Env }>()

const apiRoutes = app.basePath('/api').route('test', testRoutes)

export default app
export type ApiRoutes = typeof apiRoutes

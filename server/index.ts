import { Hono } from 'hono'
import { testRoutes } from './testRoutes'

const app = new Hono()

const apiRoutes = app.basePath('/api').route('test', testRoutes)

export default app
export type ApiRoutes = typeof apiRoutes

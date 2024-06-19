import { ApiRoutes } from '@server/src/index'
import { hc } from 'hono/client'

const client = hc<ApiRoutes>('/')

export const api = client.api

import { ApiRoutes } from '@server/index'
import { hc } from 'hono/client'

const client = hc<ApiRoutes>('/')

export const api = client.api

import { Hono } from 'hono'
import { D1Database } from '@cloudflare/workers-types'
import { drizzle } from 'drizzle-orm/d1'
import { posts } from './db/schema'
import { eq } from 'drizzle-orm'

export type Env = {
    DB: D1Database
}

const app = new Hono<{ Bindings: Env }>()

const apiRoutes = app.basePath('/api')

apiRoutes
    .get('/posts', async (c) => {
        const db = drizzle(c.env.DB)
        const result = await db.select().from(posts).all()
        return c.json(result)
    })
    .get('/posts/:id', async (c) => {
        const db = drizzle(c.env.DB)
        const id = Number(c.req.param('id'))
        const result = await db.select().from(posts).where(eq(posts.id, id))
        return c.json(result)
    })
    .post('/posts', async (c) => {
        const db = drizzle(c.env.DB)
        const { title, content } = await c.req.json()
        const result = await db.insert(posts).values({ title, content }).returning()
        return c.json(result)
    })

export default app
export type ApiRoutes = typeof apiRoutes

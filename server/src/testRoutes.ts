import { Hono } from 'hono'
import { posts } from './db/schema'
import { eq } from 'drizzle-orm'
import { Env } from './index'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

export const testRoutes = new Hono<{ Bindings: Env }>()
    .get('/posts', async (c) => {
        const db = drizzle(postgres(c.env.DB_URL, { prepare: false }))

        const result = await db.select().from(posts)
        return c.json(result)
    })
    .get('/posts/:id', async (c) => {
        const db = drizzle(postgres(c.env.DB_URL, { prepare: false }))

        const id = Number(c.req.param('id'))
        const result = await db.select().from(posts).where(eq(posts.id, id))
        return c.json(result)
    })
    .post('/posts', async (c) => {
        const db = drizzle(postgres(c.env.DB_URL, { prepare: false }))

        const { title, content } = await c.req.json()
        const result = await db.insert(posts).values({ title, content }).returning()
        return c.json(result)
    })

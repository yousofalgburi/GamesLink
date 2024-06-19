import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    dialect: 'postgresql',
    schema: 'server/src/db/schema.ts',
    out: './supabase/migrations',
    dbCredentials: {
        url: process.env.DB_URL!,
    },
})

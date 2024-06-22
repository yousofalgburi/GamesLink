import { db } from '@server/src/db'

export default db(process.env.DB_URL)

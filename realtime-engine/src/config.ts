import dotenv from 'dotenv'

dotenv.config()

export const port = 8000
export const jwtSecret = process.env.JWT_SECRET!

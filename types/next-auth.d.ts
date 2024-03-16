import type { User } from 'next-auth'
import 'next-auth/jwt'

type UserId = string

declare module 'next-auth/jwt' {
    interface JWT {
        id: UserId
        username?: string | null
        credits: number
    }
}

declare module 'next-auth' {
    interface Session {
        user: User & {
            id: UserId
            username?: string | null
            credits: number
        }
    }
}

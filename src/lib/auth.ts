import db from '@frontend/lib/db'
import { nanoid } from 'nanoid'
import { type NextAuthOptions, getServerSession } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { users } from '@server/src/db/schema'
import { eq } from 'drizzle-orm'
import type { Adapter } from 'next-auth/adapters'

export const authOptions: NextAuthOptions = {
	adapter: DrizzleAdapter(db) as Adapter,
	session: {
		strategy: 'jwt',
	},
	pages: {
		signIn: '/sign-in',
	},
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
	],
	callbacks: {
		async session({ token, session }) {
			if (token) {
				session.user.id = token.id
				session.user.name = token.name
				session.user.email = token.email
				session.user.image = token.picture
				session.user.username = token.username
				session.user.credits = token.credits
			}

			return session
		},
		async jwt({ token, user }) {
			if (!process.env.DB_URL) {
				throw new Error('DB_URL is not set')
			}

			const [dbUser] = await db.select().from(users).where(eq(users.id, user.id))

			if (!dbUser) {
				token.id = user.id
				return token
			}

			if (!dbUser.username) {
				await db.update(users).set({
					username: nanoid(10),
				})
			}

			return {
				id: dbUser.id,
				name: dbUser.name,
				email: dbUser.email,
				picture: dbUser.image,
				username: dbUser.username,
				credits: dbUser.credits,
			}
		},
		redirect() {
			return '/home'
		},
	},
}

export const getAuthSession = () => getServerSession(authOptions)

import { db } from '@/lib/db/index'
import { nanoid } from 'nanoid'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { eq } from 'drizzle-orm'
import { users } from './lib/db/schema'
import NextAuth from 'next-auth'
import google from 'next-auth/providers/google'

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: DrizzleAdapter(db),
	providers: [google],
	session: {
		strategy: 'jwt',
	},
	callbacks: {
		async session({ token, session }) {
			if (token) {
				session.user.id = token.id
				session.user.name = token.name
				session.user.email = token.email ?? ''
				session.user.image = token.picture
				session.user.username = token.username
				session.user.credits = token.credits
			}

			return session
		},
		async jwt({ token, user }) {
			const [dbUser] = await db
				.selectDistinct()
				.from(users)
				.where(eq(users.email, token.email ?? ''))

			if (!dbUser) {
				token.id = user.id ?? ''
				return token
			}

			if (!dbUser.username) {
				await db
					.update(users)
					.set({
						username: nanoid(10),
					})
					.where(eq(users.id, dbUser.id))
			}

			return {
				id: dbUser.id,
				name: dbUser.name,
				email: dbUser.email,
				picture: dbUser.image,
				username: dbUser.username,
				credits: 0,
			}
		},
	},
})

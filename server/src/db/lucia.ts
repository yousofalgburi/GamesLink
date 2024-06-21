import { db } from './db'
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle'
import { type SelectUser, sessionTable, userTable } from './schema'
import { Lucia } from 'lucia'

export function initializeLucia(DB_URL: string) {
	const adapter = new DrizzlePostgreSQLAdapter(db(DB_URL), sessionTable, userTable)

	return new Lucia(adapter, {
		sessionCookie: {
			expires: false,
		},
		getUserAttributes: (attributes) => {
			return {
				email: attributes.email,
			}
		},
	})
}

declare module 'lucia' {
	export interface Register {
		Lucia: ReturnType<typeof initializeLucia>
		DatabaseUserAttributes: SelectUser
	}
}

import type { User, Session } from 'lucia'

export type Bindings = {
	DB_URL: string
}

export type Variables = {
	user: User | null
	session: Session | null
}

import { pgEnum } from 'drizzle-orm/pg-core'

export enum friendRequestStatus {
	PENDING = 'pending',
	ACCEPTED = 'accepted',
	REJECTED = 'rejected',
}

export enum VoteType {
	UP = 'UP',
	DOWN = 'DOWN',
}

export const voteType = pgEnum('vote_type', ['UP', 'DOWN'])

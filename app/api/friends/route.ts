import { auth } from '@/auth'
import { db } from '@/db'
import { users, friendships, friendRequests } from '@/db/schema'
import { eq, inArray } from 'drizzle-orm'

export async function GET(req: Request) {
	try {
		const session = await auth()

		if (!session) {
			return new Response(JSON.stringify({ error: 'Not logged in' }), { status: 401 })
		}

		const friendsIds = await db.select({ friendId: friendships.friendId }).from(friendships).where(eq(friendships.userId, session.user.id))

		const friendsInfo = await db
			.select({ id: users.id, username: users.username, image: users.image })
			.from(users)
			.where(
				inArray(
					users.id,
					friendsIds.map((friend) => friend.friendId),
				),
			)

		const friends = friendsInfo.map((friendInfo) => ({
			name: friendInfo.username,
			image: friendInfo.image,
		}))

		const friendRequestsData = await db
			.select({
				id: friendRequests.id,
				fromUserId: friendRequests.fromUserId,
				status: friendRequests.status,
				createdAt: friendRequests.createdAt,
				name: users.username,
				image: users.image,
			})
			.from(friendRequests)
			.leftJoin(users, eq(friendRequests.fromUserId, users.id))
			.where(eq(friendRequests.toUserId, session.user.id))

		return new Response(JSON.stringify({ friends, friendRequests: friendRequestsData }))
	} catch (error: unknown) {
		console.error('Error fetching friends and requests:', error)
		if (error instanceof Error) {
			return new Response(JSON.stringify({ message: 'Error fetching friends', error: error.message }), { status: 500 })
		}
		return new Response(JSON.stringify({ message: 'Error fetching friends', error: 'Unknown error' }), { status: 500 })
	}
}

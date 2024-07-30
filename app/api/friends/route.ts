import { auth } from '@/auth'
import { db } from '@/prisma/db'

export async function GET(req: Request) {
	try {
		const session = await auth()

		if (!session) {
			return new Response(JSON.stringify({ error: 'Not logged in' }), { status: 401 })
		}

		const friendsIds = await db.friendship.findMany({
			where: {
				userId: session.user.id,
			},
		})

		const friendsInfo = await db.user.findMany({
			where: {
				id: {
					in: friendsIds.map((friend) => friend.friendId),
				},
			},
		})

		const friends = friendsIds.map((friend) => {
			const friendInfo = friendsInfo.find((info) => info.id === friend.friendId)

			return {
				name: friendInfo?.username,
				image: friendInfo?.image,
			}
		})

		const friendRequests = await db.friendRequest.findMany({
			where: {
				toUserId: session.user.id,
			},
		})

		const friendRequestsInfo = await db.user.findMany({
			where: {
				id: {
					in: friendRequests.map((friend) => friend.fromUserId),
				},
			},
		})

		const friendRequestsData = friendRequests.map((friendRequest) => {
			const friendRequestInfo = friendRequestsInfo.find((info) => info.id === friendRequest.fromUserId)

			return {
				...friendRequest,
				name: friendRequestInfo?.username,
				image: friendRequestInfo?.image,
			}
		})

		return new Response(JSON.stringify({ friends, friendRequests: friendRequestsData }))
	} catch (error: unknown) {
		if (error instanceof Error) {
			return new Response(JSON.stringify({ message: 'Error fetching friends', error: error.message }), { status: 500 })
		}
		return new Response(JSON.stringify({ message: 'Error fetching friends', error: 'Unknown error' }), { status: 500 })
	}
}

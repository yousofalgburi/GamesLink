import HiddenAuth from '@/components/HiddenAuth'
import LinkRoom from '@/components/link-room/LinkRoom'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'

export const metadata = {
	title: 'Link Room',
	description: 'The place where the AI powered game matching magic happens.',
}

interface PageProps {
	params: {
		id: string
	}
}

export default async function Page({ params: { id } }: PageProps) {
	const session = await auth()

	if (!session?.user) {
		return <HiddenAuth message='to be able to join a room.' />
	}

	const roomUsers = await db.room.findUnique({
		where: {
			roomId: id,
		},
		include: {
			members: true,
		},
	})

	if (!roomUsers) return notFound()

	if (session.user.id !== roomUsers.hostId && !roomUsers.isPublic) {
		return redirect(`/link-room/queue/${id}`)
	}

	// const roomUsersWithGames = await Promise.all(
	// 	roomUsers.members.map(async (user) => {
	// 		const games = await db.steamGame.findMany({
	// 			where: {
	// 				votes: {
	// 					some: {
	// 						userId: user.id,
	// 					},
	// 				},
	// 			},
	// 			include: {
	// 				votes: {
	// 					where: {
	// 						userId: user.id,
	// 					},
	// 				},
	// 			},
	// 			orderBy: {
	// 				voteCount: 'desc',
	// 			},
	// 		})

	// 		return {
	// 			...user,
	// 			games,
	// 		}
	// 	}),
	// )

	const { members, ...roomDetails } = roomUsers

	return (
		<div className='container mx-auto py-12'>
			<LinkRoom roomId={id} userId={session?.user.id} roomDetails={roomDetails} roomUsers={[]} />
		</div>
	)
}

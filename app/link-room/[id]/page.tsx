import HiddenAuth from '@/components/HiddenAuth'
import LinkRoom from '@/components/link-room/LinkRoom'
import { auth } from '@/auth'
import { db } from '@/db'
import { rooms, users, gameVotes, processedGames } from '@/db/schema'
import { notFound, redirect } from 'next/navigation'
import { eq, desc } from 'drizzle-orm'
import type { UserInRoom } from '@/types/linkroom'
import type { ExtendedGame } from '@/types/db'

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

	const roomData = await db.select().from(rooms).where(eq(rooms.roomId, id)).limit(1)

	if (!roomData || roomData.length === 0) return notFound()

	const room = roomData[0]

	if (session.user.id !== room.hostId && !room.isPublic) {
		return redirect(`/link-room/queue/${id}`)
	}

	const membersQuery = db.select().from(users).where(eq(users.id, room.hostId))

	const gamesQuery = db
		.select({
			id: processedGames.id,
			steamAppid: processedGames.steamAppid,
			name: processedGames.name,
			shortDescription: processedGames.shortDescription,
			headerImage: processedGames.headerImage,
			requiredAge: processedGames.requiredAge,
			isFree: processedGames.isFree,
			releaseDate: processedGames.releaseDate,
			developers: processedGames.developers,
			genres: processedGames.genres,
			categories: processedGames.categories,
			voteCount: processedGames.voteCount,
			voteType: gameVotes.voteType,
			userId: gameVotes.userId,
		})
		.from(gameVotes)
		.innerJoin(processedGames, eq(gameVotes.gameId, processedGames.id))
		.orderBy(desc(processedGames.voteCount))

	const [members, games] = await Promise.all([membersQuery, gamesQuery])

	const roomUsersWithGames: UserInRoom[] = members.map((member) => ({
		...member,
		games: games
			.filter((game) => game.userId === member.id)
			.map((game) => ({
				...game,
				shortDescription: game.shortDescription ?? '',
				headerImage: game.headerImage ?? '',
			})) as ExtendedGame[],
	}))

	const { ...roomDetails } = room

	return (
		<div className='container mx-auto py-12'>
			<LinkRoom roomId={id} userId={session?.user.id} roomDetails={roomDetails} roomUsers={roomUsersWithGames} />
		</div>
	)
}

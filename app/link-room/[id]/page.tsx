import HiddenAuth from '@/components/HiddenAuth'
import LinkRoom from '@/components/link-room/LinkRoom'
import { auth } from '@/auth'
import { db } from '@/db'
import { rooms, users, gameVotes, processedGames } from '@/db/schema'
import { notFound, redirect } from 'next/navigation'
import { eq, desc, inArray, sql, and } from 'drizzle-orm'
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

	const [room] = await db.select().from(rooms).where(eq(rooms.roomId, id)).limit(1)
	if (!room) return notFound()

	if (session.user.id !== room.hostId && !room.isPublic) {
		return redirect(`/link-room/queue/${id}`)
	}

	const updateMembersQuery = db
		.update(rooms)
		.set({ members: sql`array_append(${rooms.members}, ${session.user.id})` })
		.where(and(eq(rooms.roomId, id), sql`NOT ${rooms.members}::uuid[] @> ARRAY[${session.user.id}]::uuid[]`))
		.returning()

	const membersQuery = db
		.select()
		.from(users)
		.where(inArray(users.id, [...(room.members ?? []), session.user.id]))

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
		.where(inArray(gameVotes.userId, [...(room.members ?? []), session.user.id]))
		.orderBy(desc(processedGames.voteCount))

	const [updatedMembers, members, games] = await Promise.all([updateMembersQuery, membersQuery, gamesQuery])

	const roomUsersWithGames: UserInRoom[] = members.map((member) => ({
		...member,
		games: games
			.filter((game) => game.userId === member.id)
			.map((game) => ({
				...game,
			})) as ExtendedGame[],
	}))

	const { ...roomDetails } = room

	return (
		<div className='container mx-auto py-12'>
			<LinkRoom roomId={id} userId={session?.user.id} roomDetails={roomDetails} roomUsers={roomUsersWithGames} />
		</div>
	)
}

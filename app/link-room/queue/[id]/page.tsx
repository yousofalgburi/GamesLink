import LinkRoomQueue from '@/components/link-room/LinkRoomQueue'
import { auth } from '@/auth'

export const metadata = {
	title: 'Link Room Queue',
	description: 'A queue to wait for the host to let you in to the room.',
}

interface PageProps {
	params: {
		id: string
	}
}

export default async function Page({ params: { id } }: PageProps) {
	const session = await auth()

	if (!session?.user) {
		return null
	}

	return (
		<div className='container mx-auto py-12'>
			<LinkRoomQueue wsLink={process.env.REAL_TIME_API_URL} roomId={id} user={session?.user} />
		</div>
	)
}

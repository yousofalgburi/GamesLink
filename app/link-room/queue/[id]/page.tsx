import LinkRoomQueue from '@/components/LinkRoomQueue'
import { getAuthSession } from '@/lib/auth'

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
    const session = await getAuthSession()

    if (!session?.user) {
        return null
    }

    return (
        <div className="container mx-auto py-12">
            <LinkRoomQueue roomId={id} userId={session?.user.id} />
        </div>
    )
}

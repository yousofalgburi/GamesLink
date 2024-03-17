import LinkRoom from '@/components/LinkRoom'
import { getAuthSession } from '@/lib/auth'

export const metadata = {
    title: 'Link Room',
    description: 'The place where the AI powered game matching magic happens.',
}

export default async function Page() {
    let session = await getAuthSession()

    if (!session?.user) {
        return null
    }

    return (
        <div className="container mx-auto py-12">
            <LinkRoom userId={session?.user.id} />
        </div>
    )
}

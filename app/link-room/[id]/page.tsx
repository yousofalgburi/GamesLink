import LinkRoom from '@/components/LinkRoom'

export const metadata = {
    title: 'Link Room',
    description: 'The place where the AI powered game matching magic happens.',
}

export default async function Page() {
    // const ws = await new WebSocket('ws://localhost:8000')

    // ws.onopen = () => {
    //     console.log('WebSocket is open')
    //     ws.send('Hello, world!')
    // }

    // ws.onmessage = (event) => {
    //     console.log('Message received: ', event.data)
    // }

    return (
        <div className="container mx-auto py-12">
            <div className="grid items-start gap-8">
                <h1 className="text-3xl font-bold md:text-4xl">Link Room</h1>

                <LinkRoom />
            </div>
        </div>
    )
}

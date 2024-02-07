import Pusher from 'pusher'

export async function GET(req: Request) {
    try {
        const pusher = new Pusher({
            appId: process.env.PUSHER_APP_ID!,
            key: process.env.PUSHER_KEY!,
            secret: process.env.PUSHER_SECRET!,
            cluster: process.env.PUSHER_CLUSTER!,
            useTLS: true,
        })

        pusher.trigger('my-channel', 'my-event', {
            message: 'hello world 2',
        })

        return new Response('OK')
    } catch (error) {
        return new Response('Something went wrong.', { status: 500 })
    }
}

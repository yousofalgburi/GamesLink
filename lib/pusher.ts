import Pusher from 'pusher-js'

const pusher = new Pusher(process.env.PUSHER_KEY!, {
    cluster: process.env.PUSHER_CLUSTER!,
})

export default pusher

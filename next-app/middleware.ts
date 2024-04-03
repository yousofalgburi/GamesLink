import { NextRequest, NextResponse } from 'next/server'
import { redis } from './lib/redis'

// rate limit settings
const RATE_LIMIT = 100 // requests per minute
const EXPIRATION = 60 // 1 minute

// ban settings
const BAN_TIME = 24 * 60 * 60 // ban time: 24 hours
const BAN_THRESHOLD = 10 // times needed to be banned

export default async function rateLimitMiddleware(req: NextRequest) {
    const ip = req.ip
    if (!ip || ip == process.env.OWNER_IP) return

    const currentWindow = Math.floor(Date.now() / 1000 / EXPIRATION)
    const key = `rate_limit:${ip}:${currentWindow}`
    const banKey = `ban:${ip}`

    const isBanned = await redis.get(banKey)

    if (Number(isBanned) >= BAN_THRESHOLD) {
        return NextResponse.json({ error: 'Your IP has been banned due to excessive requests.' })
    }

    const currentCount = await redis.incr(key)
    if (currentCount === 1) {
        await redis.expire(key, EXPIRATION)
    }

    if (currentCount > RATE_LIMIT) {
        // increment the ban counter
        const banCount = await redis.incr(banKey)
        if (banCount === 1) {
            await redis.expire(banKey, BAN_TIME)
        }

        // if the ban threshold is exceeded, ban the IP
        if (banCount >= BAN_THRESHOLD) {
            // @ts-ignore
            // Not sure why TS is complaining about the signature of set. It's correct according to the docs.
            await redis.set(banKey, 'banned', (ex = BAN_TIME))
        }

        return NextResponse.json({ error: 'Too Many Requests' })
    }
}

export const config = {
    matcher: ['/api/:path*'],
}

import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { ModeToggle } from './ModeToggle'
import { buttonVariants } from './ui/button'
import { UserAccountNav } from './UserAccountNav'
import { Gamepad } from 'lucide-react'
import Credits from './Credits'
import Friends from './Friends'

export default async function Navbar() {
    const session = await getServerSession(authOptions)

    return (
        <header className="flex h-14 items-center px-4 lg:px-6">
            <Link className="flex items-center justify-center" href={`${session?.user ? '/home' : '/'}`}>
                <Gamepad className="h-6 w-6" />
                <span className="ml-2 text-2xl font-bold">GamesLink</span>
            </Link>
            <nav className="ml-auto flex items-center gap-4 sm:gap-6">
                {session?.user && <Credits />}

                <Link className="text-sm font-medium underline-offset-4 hover:underline" href="/home">
                    Home
                </Link>

                <Link className="text-sm font-medium underline-offset-4 hover:underline" href="/my-games">
                    My Games
                </Link>

                <Friends session={session} />

                <ModeToggle />
                {session?.user ? (
                    <UserAccountNav
                        user={{
                            name: session.user.name,
                            image: session.user.image,
                            email: session.user.email,
                            username: session.user.username,
                        }}
                    />
                ) : (
                    <Link href="/sign-in" className={buttonVariants()}>
                        Sign In
                    </Link>
                )}
            </nav>
        </header>
    )
}

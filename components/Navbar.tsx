import { NavigationMenu, NavigationMenuList, NavigationMenuLink } from '@/components/ui/navigation-menu'
import Link from 'next/link'
import { auth } from '@/auth'
import { GamepadIcon } from 'lucide-react'
import { UserAccountNav } from './UserAccountNav'
import SignIn from './SignIn'
import { ModeToggle } from './ModeToggle'
import Friends from './Friends'
import { Badge } from '@/components/ui/badge'

export default async function Navbar() {
	const session = await auth()

	return (
		<header className='sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm dark:bg-background-dark/80'>
			<div className='container flex h-16 items-center justify-between px-4 md:px-6'>
				<Link href='/' className='flex items-center gap-2' prefetch={false}>
					<GamepadIcon className='h-6 w-6' />
					<span className='text-lg font-bold'>GamesLink</span>
					<Badge variant='secondary' className=''>
						Beta
					</Badge>
				</Link>
				<nav className='hidden md:flex'>
					<NavigationMenu>
						<NavigationMenuList>
							<NavigationMenuLink asChild>
								<Link
									href='/home'
									className='group inline-flex h-16 items-center justify-center px-4 text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus:bg-muted focus:text-muted-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-muted data-[state=open]:bg-muted'
									prefetch={false}
								>
									Home
								</Link>
							</NavigationMenuLink>
							<NavigationMenuLink asChild>
								<Link
									href='/my-games'
									className='group inline-flex h-16 items-center justify-center px-4 text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus:bg-muted focus:text-muted-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-muted data-[state=open]:bg-muted'
									prefetch={false}
								>
									My Games
								</Link>
							</NavigationMenuLink>
							<NavigationMenuLink asChild>
								<Link
									href='/link-room'
									className='group inline-flex h-16 items-center justify-center px-4 text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus:bg-muted focus:text-muted-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-muted data-[state=open]:bg-muted'
									prefetch={false}
								>
									Link Room
								</Link>
							</NavigationMenuLink>
						</NavigationMenuList>
					</NavigationMenu>
				</nav>
				<div className='flex items-center gap-4'>
					<ModeToggle />
					<Friends session={session} />
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
						<SignIn />
					)}
				</div>
			</div>
		</header>
	)
}

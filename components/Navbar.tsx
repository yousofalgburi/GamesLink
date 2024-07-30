import { NavigationMenu, NavigationMenuList, NavigationMenuLink } from '@/components/ui/navigation-menu'
import { BellIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import { GamepadIcon } from 'lucide-react'
import { UserAccountNav } from './UserAccountNav'
import SignIn from './SignIn'
import { ModeToggle } from './ModeToggle'
import Friends from './Friends'

export default async function Navbar() {
	const session = await auth()

	return (
		<header className='sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm dark:bg-background-dark/80'>
			<div className='container flex h-16 items-center justify-between px-4 md:px-6'>
				<Link href='/' className='flex items-center gap-2' prefetch={false}>
					<GamepadIcon className='h-6 w-6' />
					<span className='text-lg font-bold'>GamesLink</span>
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
					<Button variant='ghost' size='icon'>
						<BellIcon className='h-6 w-6' />
						<span className='sr-only'>Notifications</span>
					</Button>
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

		// <nav>
		// 	<div className='mx-auto px-2 sm:px-6 lg:px-8'>
		// 		<div className='relative flex h-16 items-center justify-between'>
		// 			<div className='absolute inset-y-0 left-0 flex items-center sm:hidden'>
		// 				{/* Mobile menu button*/}
		// 				<button
		// 					type='button'
		// 					className='relative inline-flex items-center justify-center rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-inset'
		// 				>
		// 					<span className='absolute -inset-0.5' />
		// 					<span className='sr-only'>Open main menu</span>
		// 					<Bars3Icon className='block h-6 w-6' aria-hidden='true' />
		// 				</button>
		// 			</div>
		// 			<div className='flex flex-1 items-center justify-center sm:items-stretch sm:justify-start'>
		// 				<div className='flex flex-shrink-0 items-center'>
		// 					<Gamepad className='h-6 w-6' />
		// 				</div>
		// 				<div className='hidden sm:ml-6 sm:block'>
		// 					<div className='flex space-x-4'>
		// 						{navigation.map((item) => (
		// 							<Link
		// 								key={item.name}
		// 								href={item.href}
		// 								className='rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white'
		// 								aria-current={item.current ? 'page' : undefined}
		// 							>
		// 								{item.name}
		// 							</Link>
		// 						))}

		// 						{session?.user && <Credits />}
		// 					</div>
		// 				</div>
		// 			</div>
		// 			<div className='absolute inset-y-0 right-0 flex items-center gap-6 pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0'>

		// 				<button
		// 					type='button'
		// 					className='relative rounded-full  focus:outline-none focus:ring-2  focus:ring-offset-2 focus:ring-offset-gray-800'
		// 				>
		// 					<span className='absolute -inset-1.5' />
		// 					<span className='sr-only'>View notifications</span>
		// 					<BellIcon className='h-6 w-6' aria-hidden='true' />
		// 				</button>
		// 				{/* Profile dropdown relative ml-3 */}

		// 			</div>
		// 		</div>
		// 	</div>

		// 	{/* Mobile menu, show/hide based on menu state */}
		// 	<div className='sm:hidden'>
		// 		<div className='space-y-1 px-2 pb-3 pt-2'>
		// 			{navigation.map((item) => (
		// 				<Link
		// 					key={item.name}
		// 					href={item.href}
		// 					className={`block rounded-md px-3 py-2 text-base font-medium ${
		// 						item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
		// 					}`}
		// 					aria-current={item.current ? 'page' : undefined}
		// 				>
		// 					{item.name}
		// 				</Link>
		// 			))}
		// 		</div>
		// 	</div>
		// </nav>
	)
}

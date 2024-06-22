import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import Providers from '@/components/Providers'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'
import './globals.css'
import { getAuthSession } from '@/lib/auth'

export const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans',
})

export const metadata: Metadata = {
	title: 'GamesLink',
	description: 'Explore and find games to play with your friends.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const session = await getAuthSession()

	return (
		<html lang='en' suppressHydrationWarning>
			<body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
				<Providers>
					<main className='flex flex-1 flex-col'>
						<Navbar session={session} />
						<div className='min-h-[85vh]'>{children}</div>
						<Footer />
					</main>
				</Providers>
				<Toaster />
				<SonnerToaster />
			</body>
		</html>
	)
}

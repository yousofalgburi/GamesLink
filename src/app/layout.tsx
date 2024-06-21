import Footer from '@frontend/components/Footer'
import Providers from '@frontend/components/Providers'
import { Toaster as SonnerToaster } from '@frontend/components/ui/sonner'
import { Toaster } from '@frontend/components/ui/toaster'
import { cn } from '@frontend/lib/utils'
import type { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'
import './globals.css'
import Navbar from '@frontendcomponents/Navbar'

const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans',
})

export const metadata: Metadata = {
	title: 'GamesLink',
	description: 'Explore and find games to play with your friends.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en' suppressHydrationWarning>
			<body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
				<Providers>
					<main className='flex flex-1 flex-col'>
						<Navbar />
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

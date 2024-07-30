import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import Providers from '@/components/Providers'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'

const fontHeading = Manrope({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-heading',
})

const fontBody = Manrope({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-body',
})

export const metadata: Metadata = {
	title: 'GamesLink',
	description: 'Explore and find games to play with your friends.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en' suppressHydrationWarning>
			<body className={cn('min-h-screen bg-background font-sans antialiased', fontHeading.variable, fontBody.variable)}>
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

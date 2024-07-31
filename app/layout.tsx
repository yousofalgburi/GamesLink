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
		<html lang='en'>
			<body className={cn('antialiased', fontHeading.variable, fontBody.variable)}>
				<Providers>
					<Navbar />
					<div className='min-h-[85vh]'>{children}</div>
					<Footer />
				</Providers>
				<Toaster />
				<SonnerToaster />
			</body>
		</html>
	)
}

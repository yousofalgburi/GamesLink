import type { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import Providers from '@/components/Providers'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'

export const fontSans = FontSans({
    subsets: ['latin'],
    variable: '--font-sans',
})

export const metadata: Metadata = {
    title: 'GamesLink',
    description: 'Explore and find games to play with your friends.',
}

export default function RootLayout({ children, authModal }: { children: React.ReactNode; authModal: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
                <Providers>
                    <main className="flex flex-1 flex-col">
                        <Navbar />
                        <div className="min-h-[85vh]">
                            {authModal}
                            {children}
                        </div>
                        <Footer />
                    </main>
                </Providers>
                <Toaster />
                <SonnerToaster />
            </body>
        </html>
    )
}

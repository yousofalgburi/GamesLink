'use client'

import { FriendsContextProvider } from '@/lib/context/FriendsContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'
import { FC, ReactNode } from 'react'

interface LayoutProps {
    children: ReactNode
}

const queryClient = new QueryClient()

function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

const Providers: FC<LayoutProps> = ({ children }) => {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <QueryClientProvider client={queryClient}>
                <SessionProvider>
                    <FriendsContextProvider>{children}</FriendsContextProvider>
                </SessionProvider>
            </QueryClientProvider>
        </ThemeProvider>
    )
}

export default Providers

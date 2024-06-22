'use client'

import { FriendsContextProvider } from '@/context/FriendsContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'
import { FC, ReactNode } from 'react'
import PlausibleProvider from 'next-plausible'

interface LayoutProps {
	children: ReactNode
}

const queryClient = new QueryClient()

function ThemeProvider({ children, ...props }: ThemeProviderProps) {
	return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

const Providers: FC<LayoutProps> = ({ children }) => {
	return (
		<PlausibleProvider domain='gameslink.app'>
			<ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
				<QueryClientProvider client={queryClient}>
					<SessionProvider>
						<FriendsContextProvider>{children}</FriendsContextProvider>
					</SessionProvider>
				</QueryClientProvider>
			</ThemeProvider>
		</PlausibleProvider>
	)
}

export default Providers

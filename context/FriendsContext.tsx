import { type PropsWithChildren, createContext, useState } from 'react'

type FriendsContextType = {
	friends: { name: string; image: string }[]
	setFriends: React.Dispatch<React.SetStateAction<{ name: string; image: string }[]>>
}

export const FriendsContext = createContext<FriendsContextType>({
	friends: [],
	setFriends: () => {},
})

export const FriendsContextProvider = ({ children }: PropsWithChildren<{ children: React.ReactNode }>) => {
	const [friends, setFriends] = useState<{ name: string; image: string }[]>([])

	return <FriendsContext.Provider value={{ friends, setFriends }}>{children}</FriendsContext.Provider>
}

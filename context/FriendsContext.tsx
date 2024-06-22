import { PropsWithChildren, createContext, useState } from 'react'

// TODO: turn into a web socket real time

type FriendsContextType = {
	friends: { name: string; image: string }[]
	setFriends: React.Dispatch<React.SetStateAction<{ name: string; image: string }[]>>
}

export const FriendsContext = createContext<FriendsContextType>({
	friends: [],
	setFriends: () => {},
})

export const FriendsContextProvider = ({ children }: PropsWithChildren<{}>) => {
	const [friends, setFriends] = useState<{ name: string; image: string }[]>([])

	return <FriendsContext.Provider value={{ friends, setFriends }}>{children}</FriendsContext.Provider>
}

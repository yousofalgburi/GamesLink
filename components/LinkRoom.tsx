'use client'

import { useCustomToasts } from '@/hooks/use-custom-toasts'
import { FriendsContext } from '@/lib/context/FriendsContext'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useContext, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { useToast } from './ui/use-toast'

export default function LinkRoom() {
    const { data: session } = useSession()
    const router = useRouter()
    const pathname = usePathname()

    const { loginToast } = useCustomToasts()
    const { toast } = useToast()
    const { friends } = useContext(FriendsContext)
    const [roomStarted, setRoomStarted] = useState(pathname.includes('/new') ? false : true)

    const { mutate: createRoom, isPending: isLoading } = useMutation({
        mutationFn: async () => {
            const roomID = uuidv4()

            await axios.post('/api/linkroom/create', {
                roomID,
            })

            return roomID
        },
        onError: (err) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 401) {
                    return loginToast()
                }
            }

            return toast({
                title: 'Something went wrong.',
                description: 'Room was not created. Please try again.',
                variant: 'destructive',
            })
        },
        onMutate: () => {},
        onSuccess: (roomID: string) => {
            router.push(`/link-room/${roomID}`)

            setRoomStarted(true)
        },
    })

    return (
        <div className="grid grid-cols-2 gap-10">
            {roomStarted ? (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Test 1</CardTitle>
                            <CardDescription>Card Description</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Card Content</p>
                        </CardContent>
                        <CardFooter>
                            <p>Card Footer</p>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardContent className="flex h-full w-full items-center justify-center">
                            <Button
                                onClick={() => {
                                    toast({
                                        title: 'Copied',
                                        description: 'The invite link has been copied to your clipboard',
                                    })
                                    navigator.clipboard.writeText('test')
                                }}
                            >
                                Copy Invite Link
                            </Button>
                        </CardContent>
                    </Card>
                </>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Start a Room</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <Button
                            onClick={() => {
                                createRoom()
                                toast({
                                    title: 'Room Started',
                                    description: 'The room has been started',
                                })
                            }}
                        >
                            Start Room
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

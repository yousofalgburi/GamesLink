'use client'

import axios, { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users } from 'lucide-react'
import { Input } from './ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UsernameValidator } from '@/lib/validators/username'
import { useMutation } from '@tanstack/react-query'
import { toast } from './ui/use-toast'
import { FriendRequest } from '@prisma/client'
import { formatTimeToNow } from '@/lib/utils'
import { UserAvatar } from './UserAvatar'
import { Session } from 'next-auth'

type FormData = z.infer<typeof UsernameValidator>

type FriendRequestType = FriendRequest & {
    name: string
    image: string
}

export default function Friends({ session }: { session: Session | null }) {
    const [friendRequest, setFriendRequest] = useState<FriendRequestType[]>([])
    const [friends, setFriends] = useState<{ name: string; image: string }[]>([])

    const {
        handleSubmit,
        register,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(UsernameValidator),
        defaultValues: {
            name: '',
        },
    })

    const { mutate: sendFriendRequest, isPending: isLoading } = useMutation({
        mutationFn: async ({ name }: FormData) => {
            const payload: FormData = { name }

            const { data } = await axios.post(`/api/friends/send`, payload)
            return data
        },
        onError: (err) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 409) {
                    return toast({
                        title: 'User does not exist.',
                        description: 'Please check the spelling.',
                        variant: 'destructive',
                    })
                }

                if (err.response?.status === 410) {
                    return toast({
                        title: 'Request already sent.',
                        description: 'Please wait for the user to respond.',
                        variant: 'destructive',
                    })
                }

                if (err.response?.status === 411) {
                    return toast({
                        title: 'Already friends.',
                        description: 'You are already friends with this user.',
                        variant: 'destructive',
                    })
                }

                if (err.response?.status === 412) {
                    return toast({
                        title: 'That is yourself.',
                        description: 'You cannot send a friend request to yourself.',
                        variant: 'destructive',
                    })
                }
            }

            return toast({
                title: 'Something went wrong.',
                description: 'Friend request not sent. Please try again.',
                variant: 'destructive',
            })
        },
        onSuccess: () => {
            toast({
                description: 'Friend request sent.',
            })
        },
    })

    const { mutate: rejectFriendRequest } = useMutation({
        mutationFn: async ({ id }: { id: string }) => {
            const payload = { id }
            setFriendRequest((prev) => prev.filter((request) => request.id !== id))
            const { data } = await axios.post(`/api/friends/reject`, payload)
            return data
        },
        onError: (err) => {
            return toast({
                title: 'Something went wrong.',
                description: 'Friend request not rejected. Please try again.',
                variant: 'destructive',
            })
        },
        onSuccess: () => {
            toast({
                description: 'Request Rejected.',
            })
        },
    })

    const { mutate: acceptFriendRequest } = useMutation({
        mutationFn: async ({ id }: { id: string }) => {
            const payload = { id }
            const request = friendRequest.find((request) => request.id === id)
            setFriendRequest((prev) => prev.filter((request) => request.id !== id))
            const { data } = await axios.post(`/api/friends/accept`, payload)
            return data
        },
        onError: (err) => {
            return toast({
                title: 'Something went wrong.',
                description: 'Friend request not accepted. Please try again.',
                variant: 'destructive',
            })
        },
        onSuccess: () => {
            toast({
                description: 'Request Accepted.',
            })
        },
    })

    const { mutate: unfriend } = useMutation({
        mutationFn: async ({ friendName }: { friendName: string }) => {
            const payload = { friendName }
            setFriends((prev) => prev.filter((friend) => friend.name !== friendName))
            const { data } = await axios.post(`/api/friends/unfriend`, payload)
            return data
        },
        onError: (err) => {
            return toast({
                title: 'Something went wrong.',
                description: 'Unfriend unsuccessful. Please try again.',
                variant: 'destructive',
            })
        },
        onSuccess: () => {
            toast({
                description: 'Unfriended.',
            })
        },
    })

    useEffect(() => {
        const getFriends = async () => {
            if (!session) return

            try {
                const { data } = await axios.get(`/api/friends`)
                setFriends(data.friends)
                setFriendRequest(data.friendRequests)
            } catch (error) {
                console.log(error)
            }
        }

        getFriends()

        const interval = setInterval(async () => {
            getFriends()
        }, 10000)

        return () => clearInterval(interval)
    }, [])

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Users className="cursor-pointer" />
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Friends</SheetTitle>
                    <SheetDescription>
                        Your friends show up here. You can add and view pending friend requests.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit((e) => sendFriendRequest(e))} className="flex flex-col gap-2 pt-4">
                    <div>
                        <h2 className="text-md font-medium">Add a friend</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Username
                        </Label>

                        <Input id="name" {...register('name')} className="col-span-3" />
                    </div>

                    {errors?.name && <p className="px-1 text-xs text-red-600">{errors.name.message}</p>}

                    <div className="flex items-center justify-end">
                        <Button isLoading={isLoading}>Send</Button>
                    </div>
                </form>

                <Tabs defaultValue="friends" className="py-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="friends">Friends</TabsTrigger>
                        <TabsTrigger value="pendingRequests">Pending Requests</TabsTrigger>
                    </TabsList>

                    <TabsContent value="friends">
                        <Card className="py-4">
                            <CardContent className="space-y-4">
                                {friends &&
                                    friends.map((friend) => (
                                        <div key={friend.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <UserAvatar user={friend} />
                                                <Label htmlFor="name">{friend.name}</Label>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button size="sm" disabled>
                                                    Invite
                                                </Button>
                                                <Button
                                                    onClick={() => unfriend({ friendName: friend.name })}
                                                    size="sm"
                                                    variant="destructive"
                                                >
                                                    Unfriend
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="pendingRequests">
                        <Card className="py-4">
                            <CardContent className="space-y-4">
                                {friendRequest &&
                                    friendRequest.map((request) => (
                                        <div key={request.id} className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <UserAvatar user={request} />
                                                <div className="flex flex-col">
                                                    <Label htmlFor="name">{request.name}</Label>
                                                    <p className="truncate text-sm text-muted-foreground">
                                                        Sent {formatTimeToNow(request.createdAt)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => acceptFriendRequest({ id: request.id })}
                                                >
                                                    Accept
                                                </Button>
                                                <Button
                                                    onClick={() => rejectFriendRequest({ id: request.id })}
                                                    variant="destructive"
                                                    size="sm"
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <SheetFooter>
                    <SheetClose asChild>
                        <Button type="submit">Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

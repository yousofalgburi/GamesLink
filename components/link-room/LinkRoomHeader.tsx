'use client'

import type { UserInRoom } from '@/types/linkroom'
import { UserAvatar } from '../UserAvatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import axios from 'axios'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { rooms, users } from '@/db/schema'
import type { InferSelectModel } from 'drizzle-orm'

export default function LinkRoomHeader({
	userId,
	roomId,
	usersInRoom,
	roomDetails,
	waitList,
	publicAccess,
	setPublicAccess,
}: {
	usersInRoom: UserInRoom[]
	roomDetails: InferSelectModel<typeof rooms>
	userId: string
	waitList: InferSelectModel<typeof users>[]
	publicAccess: boolean
	setPublicAccess: (value: boolean) => void
	roomId: string
}) {
	return (
		<div className='flex justify-between'>
			<div className='flex items-center gap-2'>
				<h1 className='text-3xl font-bold md:text-4xl'>Link Room ({usersInRoom.length}/10)</h1>
				<p className='truncate text-sm text-muted-foreground'>Created on {roomDetails.createdAt.toLocaleString()}</p>
			</div>

			<div className='flex gap-4'>
				<Dialog>
					<DialogTrigger asChild>
						<Button disabled={roomDetails.hostId !== userId} variant='outline'>
							Show Room Queue
						</Button>
					</DialogTrigger>
					<DialogContent className='sm:max-w-[425px]'>
						<DialogHeader>
							<DialogTitle>Users Wait List</DialogTitle>
							<DialogDescription>Users waiting to join room.</DialogDescription>
						</DialogHeader>
						<div className='grid gap-4 py-4'>
							{waitList.length ? (
								waitList.map((user) => (
									<div key={user.name} className='flex items-center justify-between'>
										<div className='flex items-center gap-2'>
											<UserAvatar user={user} />
											<Label htmlFor='name'>{user.name}</Label>
										</div>

										<div className='flex gap-2'>
											<Button size='sm'>Accept</Button>
										</div>
									</div>
								))
							) : (
								<Label>No users in queue</Label>
							)}
						</div>
					</DialogContent>
				</Dialog>

				<div className='flex items-center space-x-2'>
					<Switch
						checked={publicAccess}
						onCheckedChange={async (e) => {
							setPublicAccess(e)
							await axios.patch(`/api/linkroom/events/access?roomId=${roomId}&publicAccess=${e}`)
						}}
						id='airplane-mode'
						disabled={roomDetails.hostId !== userId}
					/>
					<Label htmlFor='airplane-mode'>Public</Label>
				</div>

				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>
							<Button disabled>Roll!</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>This feature is still in progress. Coming soon!</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
		</div>
	)
}

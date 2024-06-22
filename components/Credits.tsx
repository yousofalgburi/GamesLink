'use client'

import { Icons } from '@/components/Icons'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useSession } from 'next-auth/react'
import { Button } from './ui/button'

const Credits = () => {
	const { data: session } = useSession()

	return (
		<>
			<Dialog>
				<DialogTrigger asChild>
					<Button variant='ghost' className='className="text-sm hover:underline" flex gap-2 font-medium underline-offset-4'>
						{session?.user?.credits} Credits
					</Button>
				</DialogTrigger>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>Credits</DialogTitle>
					</DialogHeader>

					<div className='flex flex-col space-y-2 text-center'>
						<Icons.logo className='mx-auto h-6 w-6' />
						<p className='mx-auto max-w-xs text-sm'>
							Coming soon, 1 credit for an AI generated list of games to play using games you liked/disliked plus games your friends
							disliked/liked.
						</p>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}

export default Credits

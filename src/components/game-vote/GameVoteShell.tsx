import { Loader2, ThumbsDown, ThumbsUp } from 'lucide-react'
import { Button } from '@frontend/components/ui/button'

export default function GameVoteShell() {
	return (
		<div className='flex items-center gap-4'>
			<Button variant='ghost' aria-label='upvote'>
				<ThumbsUp className='h-5 w-5 text-zinc-700' />
			</Button>

			<Loader2 className='text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70' />

			<Button variant='ghost' aria-label='downvote'>
				<ThumbsDown className='h-5 w-5 text-zinc-700' />
			</Button>
		</div>
	)
}

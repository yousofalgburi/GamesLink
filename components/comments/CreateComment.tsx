'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '../ui/use-toast'
import type { CommentRequest } from '@/lib/validators/comment'
import { useCustomToasts } from '@/hooks/use-custom-toasts'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { type FC, useState } from 'react'
import words from 'profane-words'

interface CreateCommentProps {
	gameId: string
	replyToId?: string
}

const CreateComment: FC<CreateCommentProps> = ({ gameId, replyToId }) => {
	const [input, setInput] = useState<string>('')
	const router = useRouter()
	const { loginToast } = useCustomToasts()

	const { mutate: comment, isPending: isLoading } = useMutation({
		mutationFn: async ({ gameId, text, replyToId }: CommentRequest) => {
			if (words.includes(text.toLowerCase())) {
				return toast({
					title: 'Something went wrong.',
					description: 'Please keep it nice :)',
					variant: 'destructive',
				})
			}

			const payload: CommentRequest = { gameId, text, replyToId }

			const { data } = await axios.patch('/api/comment', payload)
			return data
		},
		onError: (err) => {
			if (err instanceof AxiosError) {
				if (err.response?.status === 401) {
					return loginToast()
				}
			}

			return toast({
				title: 'Something went wrong.',
				description: "Comment wasn't created successfully. Please try again.",
				variant: 'destructive',
			})
		},
		onSuccess: () => {
			router.refresh()
			setInput('')
		},
	})

	return (
		<div className='grid w-full gap-1.5'>
			<Label htmlFor='comment'>Your comment</Label>
			<div className='mt-2'>
				<Textarea
					className='max-h-40'
					id='comment'
					value={input}
					onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
					maxLength={256}
					rows={1}
					placeholder='What are your thoughts?'
				/>

				<div className='mt-2 flex justify-end'>
					<Button isLoading={isLoading} disabled={input.length === 0} onClick={() => comment({ gameId, text: input, replyToId })}>
						Post
					</Button>
				</div>
			</div>
		</div>
	)
}

export default CreateComment

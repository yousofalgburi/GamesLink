'use client'

import { useCustomToasts } from '@/hooks/use-custom-toasts'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useToast } from '../ui/use-toast'

export default function LinkRoomNew() {
	const router = useRouter()
	const { loginToast } = useCustomToasts()
	const { toast } = useToast()

	const { mutate: createRoom, isPending: isLoading } = useMutation({
		mutationFn: async () => {
			const roomId = uuidv4()

			const { data } = await axios.post('/api/linkroom/create', {
				roomId,
			})

			return data as { roomId: string }
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
		onSuccess: ({ roomId }) => {
			router.push(`/link-room/${roomId}`)
		},
	})

	return (
		<div className='grid grid-cols-2 gap-10'>
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
		</div>
	)
}

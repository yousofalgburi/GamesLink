'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { signIn } from 'next-auth/react'
import * as React from 'react'
import { FC } from 'react'
import { Icons } from './Icons'
import { useToast } from './ui/use-toast'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const UserAuthForm: FC<UserAuthFormProps> = ({ className, ...props }) => {
	const { toast } = useToast()
	const [isLoading, setIsLoading] = React.useState<boolean>(false)

	const loginWithGoogle = async () => {
		setIsLoading(true)

		try {
			await signIn('google')
		} catch (error) {
			toast({
				title: 'Error',
				description: 'There was an error logging in with Google',
				variant: 'destructive',
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div {...props} className={cn('flex justify-center', className)}>
			<Button isLoading={isLoading} type='button' size='sm' className='w-full' onClick={loginWithGoogle} disabled={isLoading}>
				{isLoading ? null : <Icons.google className='mr-2 h-4 w-4' />}
				Google
			</Button>
		</div>
	)
}

export default UserAuthForm

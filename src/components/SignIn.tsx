'use client'

import { Button } from '@frontend/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@frontend/components/ui/card'
import { Input } from '@frontend/components/ui/input'
import { Label } from '@frontend/components/ui/label'
import { api } from '@frontendlib/api'

export function SignIn() {
	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const formData = new FormData(event.currentTarget)
		const email = formData.get('email')
		const password = formData.get('password')

		if (!email || !password) {
			console.log('Email or password is required')
			return
		}

		try {
			const response = await fetch(api.auth.login.$url(), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password }),
			})

			if (!response.ok) {
				throw new Error('Login failed')
			}

			const data = await response.json()
			console.log(data)
			// Handle response
		} catch (error) {
			console.error('Error:', error)
			// Handle error
		}
	}

	return (
		<Card className='m-auto max-w-sm'>
			<CardHeader>
				<CardTitle className='text-2xl'>Login</CardTitle>
				<CardDescription>Enter your email below to login to your account</CardDescription>
			</CardHeader>
			<CardContent>
				<form className='grid gap-4' method='POST' onSubmit={handleSubmit}>
					<div className='grid gap-2'>
						<Label htmlFor='email'>Email</Label>
						<Input id='email' name='email' type='email' placeholder='m@example.com' required />
					</div>
					<div className='grid gap-2'>
						<div className='flex items-center'>
							<Label htmlFor='password'>Password</Label>
							<a href='/auth/forgot-password' className='ml-auto inline-block text-sm underline'>
								Forgot your password?
							</a>
						</div>
						<Input id='password' name='password' type='password' required />
					</div>
					<Button type='submit' className='w-full'>
						Login
					</Button>
					<Button variant='outline' className='w-full' disabled>
						Login with Google
					</Button>
				</form>
				<div className='mt-4 text-center text-sm'>
					Don&apos;t have an account?{' '}
					<a href='/auth/signup' className='underline'>
						Sign up
					</a>
				</div>
			</CardContent>
		</Card>
	)
}

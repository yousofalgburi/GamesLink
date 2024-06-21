import { Button } from '@frontend/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@frontend/components/ui/card'
import { Label } from '@frontend/components/ui/label'
import { Input } from '@frontend/components/ui/input'

export function SignUp() {
	return (
		<Card className='mx-auto max-w-sm'>
			<CardHeader>
				<CardTitle className='text-xl'>Sign Up</CardTitle>
				<CardDescription>Enter your information to create an account</CardDescription>
			</CardHeader>
			<CardContent>
				<div className='grid gap-4'>
					<div className='grid gap-2'>
						<Label htmlFor='first-name'>Full Name</Label>
						<Input id='full-name' placeholder='Max Robinson' required />
					</div>
					<div className='grid gap-2'>
						<Label htmlFor='email'>Email</Label>
						<Input id='email' type='email' placeholder='m@example.com' required />
					</div>
					<div className='grid gap-2'>
						<Label htmlFor='password'>Password</Label>
						<Input id='password' type='password' />
					</div>
					<Button type='submit' className='w-full'>
						Create an account
					</Button>
					<Button variant='outline' className='w-full'>
						Sign up with GitHub
					</Button>
				</div>
				<div className='mt-4 text-center text-sm'>
					Already have an account?{' '}
					<a href='/auth/signin' className='underline'>
						Sign in
					</a>
				</div>
			</CardContent>
		</Card>
	)
}

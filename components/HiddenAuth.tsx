import SignIn from './SignIn'

export default function HiddenAuth({ message }: { message: string }) {
	return (
		<div className='flex h-20 items-center justify-center gap-4'>
			<p>Please</p>
			<SignIn variant='link' />
			<p>{message}</p>
		</div>
	)
}

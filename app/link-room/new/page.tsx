import LinkRoomNew from '@/components/link-room/LinkRoomNew'

export const metadata = {
	title: 'Link Room',
	description: 'The place where the AI powered game matching magic happens.',
}

export default async function Page() {
	return (
		<div className='container mx-auto py-12'>
			<div className='grid items-start gap-8'>
				<h1 className='text-3xl font-bold md:text-4xl'>Link Room</h1>

				<LinkRoomNew />
			</div>
		</div>
	)
}

import { Icons } from '@/components/Icons'
import Image from 'next/image'
import { Avatar, AvatarFallback } from './ui/avatar'
import type { users } from '@/db/schema'
import type { InferSelectModel } from 'drizzle-orm'
import type { AvatarProps } from '@radix-ui/react-avatar'

interface UserAvatarProps extends AvatarProps {
	user: Pick<InferSelectModel<typeof users>, 'image' | 'name'>
}

export function UserAvatar({ user, ...props }: UserAvatarProps) {
	return (
		<Avatar {...props}>
			{user.image ? (
				<div className='relative aspect-square h-full w-full'>
					<Image
						src={user.image}
						width={280}
						height={440}
						sizes='(max-width: 320px) 280px, (max-width: 480px) 440px, 800px'
						alt='profile picture'
						referrerPolicy='no-referrer'
					/>
				</div>
			) : (
				<AvatarFallback>
					<span className='sr-only'>{user?.name}</span>
					<Icons.user className='h-4 w-4' />
				</AvatarFallback>
			)}
		</Avatar>
	)
}

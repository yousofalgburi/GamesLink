import { Icons } from '@frontend/components/Icons'
import type { AvatarProps } from '@radix-ui/react-avatar'
import Image from 'next/image'
import { Avatar, AvatarFallback } from '@frontend/components/ui/avatar'
import type { User } from 'next-auth'

interface UserAvatarProps extends AvatarProps {
	user: Pick<User, 'image' | 'name'>
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

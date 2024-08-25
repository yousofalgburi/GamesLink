import Link from 'next/link'

export function Footer() {
	const legalLinks = [
		{ label: 'Terms of Service', href: '/terms' },
		{ label: 'Privacy Policy', href: '/privacy' },
		{ label: 'Cookie Policy', href: '/cookies' },
	]

	return (
		<footer className='bg-background border-t border-border'>
			<div className='container mx-auto px-4 py-10'>
				<div className='flex flex-col md:flex-row justify-between items-center'>
					<div className='flex gap-4 items-center'>
						<p className='text-sm text-muted-foreground mb-4 md:mb-0'>
							&copy; {new Date().getFullYear()} GamesLink. All rights reserved.
						</p>

						<div>
							{legalLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className='text-sm text-muted-foreground hover:text-primary transition-colors mr-4'
								>
									{link.label}
								</Link>
							))}
						</div>
					</div>

					{/* <div className='flex space-x-4'>
						<SocialLink href='https://facebook.com/gameslink' Icon={Facebook} />
						<SocialLink href='https://twitter.com/gameslink' Icon={Twitter} />
						<SocialLink href='https://linkedin.com/company/gameslink' Icon={Linkedin} />
						<SocialLink href='https://instagram.com/gameslink' Icon={Instagram} />
					</div> */}
				</div>
			</div>
		</footer>
	)
}

import { buttonVariants } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Page() {
	return (
		<div className='flex flex-col min-h-screen'>
			<main className='flex-1'>
				<section className='relative h-screen flex items-center justify-center overflow-hidden'>
					<div className='absolute inset-0 z-0'>
						<Image src='/homepage.png' alt='GamesLink interface background' layout='fill' objectFit='cover' quality={100} priority />
						<div className='absolute inset-0 bg-background/70' />
					</div>
					<div className='container relative z-10 px-4 md:px-6 text-center'>
						<h1 className='text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl mb-6'>
							Discover, Connect, and Play Together
						</h1>
						<p className='mx-auto max-w-[800px] text-xl text-muted-foreground mb-8'>
							GamesLink revolutionizes how you find and share games. Say goodbye to endless debates and hello to your next gaming
							adventure.
						</p>
						<div className='flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4'>
							<Link href='/home' className={buttonVariants({ variant: 'default', size: 'lg' })}>
								Get Started
								<ChevronRight className='ml-2 h-5 w-5' />
							</Link>
							<Link href='#features' className={buttonVariants({ variant: 'outline', size: 'lg' })}>
								Explore Features
							</Link>
						</div>
					</div>
					<div className='absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent' />
				</section>

				<section id='features' className='w-full py-24 bg-secondary'>
					<div className='container px-4 md:px-6'>
						<h2 className='text-3xl font-bold tracking-tighter text-center mb-12'>Discover GamesLink Features</h2>
						<div className='grid gap-12 lg:grid-cols-3'>
							<div className='flex flex-col items-center space-y-4 text-center'>
								<div className='relative w-full h-64 rounded-lg overflow-hidden'>
									<Image
										src='/homepage.png'
										alt='GamesLink game library'
										layout='fill'
										objectFit='cover'
										className='transition-transform duration-300 hover:scale-110'
									/>
									<div className='absolute inset-0 bg-background/40 flex items-center justify-center'>
										<h3 className='text-2xl font-bold text-foreground'>Extensive Game Library</h3>
									</div>
								</div>
								<p className='text-muted-foreground'>Browse through our vast collection of games, from indie gems to AAA titles.</p>
							</div>
							<div className='flex flex-col items-center space-y-4 text-center'>
								<div className='relative w-full h-64 rounded-lg overflow-hidden'>
									<Image
										src='/link-room.png'
										alt='GamesLink Link Room'
										layout='fill'
										objectFit='cover'
										className='transition-transform duration-300 hover:scale-110'
									/>
									<div className='absolute inset-0 bg-background/40 flex items-center justify-center'>
										<h3 className='text-2xl font-bold text-foreground'>Link Room</h3>
									</div>
								</div>
								<p className='text-muted-foreground'>Collaborate with friends to find the perfect game for your group.</p>
							</div>
							<div className='flex flex-col items-center space-y-4 text-center'>
								<div className='relative w-full h-64 rounded-lg overflow-hidden'>
									<Image
										src='/game-page.png'
										alt='GamesLink detailed game page'
										layout='fill'
										objectFit='cover'
										className='transition-transform duration-300 hover:scale-110'
									/>
									<div className='absolute inset-0 bg-background/40 flex items-center justify-center'>
										<h3 className='text-2xl font-bold text-foreground'>Detailed Game Pages</h3>
									</div>
								</div>
								<p className='text-muted-foreground'>
									Get comprehensive information about each game, including genres, categories, and community feedback.
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className='w-full py-24'>
					<div className='container px-4 md:px-6'>
						<div className='grid gap-10 lg:grid-cols-2 lg:gap-20 items-center'>
							<div className='space-y-4'>
								<h2 className='text-3xl font-bold tracking-tighter md:text-4xl/tight'>We fix the "what should we play?" problem</h2>
								<p className='max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed'>
									GamesLink is designed to eliminate the endless debate over what game to play next. Our platform offers:
								</p>
								<ul className='space-y-2 text-muted-foreground'>
									<li className='flex items-center'>
										<ChevronRight className='mr-2 h-4 w-4 text-primary' />
										Powerful filters and AI-powered search
									</li>
									<li className='flex items-center'>
										<ChevronRight className='mr-2 h-4 w-4 text-primary' />
										Personalized game recommendations
									</li>
									<li className='flex items-center'>
										<ChevronRight className='mr-2 h-4 w-4 text-primary' />
										Collaborative decision-making tools
									</li>
								</ul>
							</div>
							<div className='relative h-[400px] rounded-xl overflow-hidden'>
								<Image
									src='/my-games.png'
									alt='GamesLink My Games interface'
									layout='fill'
									objectFit='cover'
									className='rounded-xl shadow-lg'
								/>
							</div>
						</div>
					</div>
				</section>

				<section id='faq' className='w-full py-24 bg-secondary'>
					<div className='container px-4 md:px-6'>
						<h2 className='text-3xl font-bold tracking-tighter text-center mb-12'>Frequently Asked Questions</h2>
						<div className='grid gap-8 lg:grid-cols-2 lg:gap-12'>
							<div className='space-y-4'>
								<h3 className='text-xl font-bold'>Is GamesLink free to use?</h3>
								<p className='text-muted-foreground'>
									GamesLink offers a generous free tier experience. We also offer paid features like the Link Room, but we give you
									starter credits to try it out.
								</p>
							</div>
							<div className='space-y-4'>
								<h3 className='text-xl font-bold'>How do we use our team credits?</h3>
								<p className='text-muted-foreground'>
									Credits are used in the Link Room where one credit per person is used, and link results are saved for future
									reference.
								</p>
							</div>
							<div className='space-y-4'>
								<h3 className='text-xl font-bold'>Can I add a game that's not listed?</h3>
								<p className='text-muted-foreground'>
									We're working on a system that allows users to submit games for review and addition to our library.
								</p>
							</div>
							<div className='space-y-4'>
								<h3 className='text-xl font-bold'>Is GamesLink available in other languages?</h3>
								<p className='text-muted-foreground'>
									Currently, GamesLink is in English only. We're working on adding support for more languages and region-specific
									recommendations.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* <section className='w-full py-24'>
					<div className='container px-4 md:px-6'>
						<div className='flex flex-col items-center space-y-4 text-center'>
							<div className='space-y-2'>
								<h2 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>Stay Updated</h2>
								<p className='mx-auto max-w-[700px] text-muted-foreground md:text-xl'>
									Subscribe to our newsletter for the latest gaming insights and GamesLink updates.
								</p>
							</div>
							<div className='w-full max-w-sm space-y-2'>
								<form className='flex space-x-2'>
									<Input
										type='email'
										placeholder='Enter your email'
										className='max-w-lg flex-1 bg-secondary text-foreground placeholder-muted-foreground border-input'
									/>
									<button type='submit' className={buttonVariants({ variant: 'default' })}>
										Subscribe
									</button>
								</form>
								<p className='text-xs text-muted-foreground'>We respect your privacy. Unsubscribe at any time.</p>
							</div>
						</div>
					</div>
				</section> */}
			</main>
		</div>
	)
}

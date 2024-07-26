import { buttonVariants } from '@/components/ui/button'
import { Github } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default async function Page() {
	return (
		<section className='flex min-h-[80vh] w-full items-center py-12 md:py-24 lg:min-h-[87.5vh] lg:items-start'>
			<div className='container px-4 md:px-6'>
				<div className='absolute inset-x-0 top-[calc(15%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl' aria-hidden='true'>
					<div
						className='relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:w-[72.1875rem]'
						style={{
							clipPath: `polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 
                                72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 
                                0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)`,
						}}
					/>
				</div>

				<div className='flex flex-col gap-16 lg:gap-48'>
					<div className='mx-auto max-w-[85rem] px-4 sm:px-6 lg:px-8'>
						<div className='flex flex-col items-center transition-all'>
							<div className='relative mb-1 rounded-full px-3 py-1 text-sm leading-6 ring-1 ring-gray-900/10 hover:ring-gray-900/20'>
								<a className='flex gap-2' target='_blank' rel='noreferrer' href='https://github.com/yousofalgburi/GamesLink'>
									We are open source!
									<Github />
								</a>
							</div>
							<h1 className='text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl'>Discover Your Next Game</h1>
							<p className='mt-3 text-lg text-gray-800 dark:text-gray-400'>Your place to find games to play with friends.</p>

							<div className='mt-5 flex flex-col items-center gap-2 sm:flex-row sm:gap-3 lg:mt-8'>
								<Link className={buttonVariants()} href='/home'>
									View Games
								</Link>
							</div>

							<Image
								className='mt-10 w-full rounded-xl'
								width={1600}
								height={900}
								src='/hero_image.png'
								alt='A game cover of Far Cry 3'
							/>
						</div>
					</div>

					<div className='mx-auto max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14'>
						<div className='md:grid md:grid-cols-2 md:items-center md:gap-12 xl:gap-32'>
							<div className='transition-all'>
								<Image
									className='rounded-xl'
									width={800}
									height={500}
									src='/link_room.png'
									alt='A game cover of The Witcher 3: Wild Hunt'
								/>
							</div>

							<div className='mt-5 sm:mt-10 lg:mt-0'>
								<div className='space-y-6 transition-all sm:space-y-8'>
									<div className='space-y-2 md:space-y-4'>
										<h2 className='text-3xl font-bold text-gray-800 dark:text-gray-200 lg:text-4xl'>
											We fix the &quot;what should we play?&quot; problem
										</h2>
										<p className='text-gray-500'>
											Many gamers have experiencd the problem of not knowing what to play. Our platform aims to solve that
											problem.
										</p>
									</div>

									<ul className='space-y-2 sm:space-y-4'>
										<li className='flex space-x-3'>
											<span className='mt-0.5 flex size-5 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-800/30 dark:text-blue-500'>
												<svg
													className='size-3.5 flex-shrink-0'
													xmlns='http://www.w3.org/2000/svg'
													width='24'
													height='24'
													viewBox='0 0 24 24'
													fill='none'
													stroke='currentColor'
													strokeWidth='2'
													strokeLinecap='round'
													strokeLinejoin='round'
													role='img'
													aria-labelledby='checkmarkTitle'
												>
													<title id='checkmarkTitle'>Checkmark Icon</title>
													<polyline points='20 6 9 17 4 12' />
												</svg>
											</span>

											<span className='text-sm text-gray-500 sm:text-base'>
												<span className='font-bold'>Easy & fast</span> game browsing
											</span>
										</li>

										<li className='flex space-x-3'>
											<span className='mt-0.5 flex size-5 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-800/30 dark:text-blue-500'>
												<svg
													className='size-3.5 flex-shrink-0'
													xmlns='http://www.w3.org/2000/svg'
													width='24'
													height='24'
													viewBox='0 0 24 24'
													fill='none'
													stroke='currentColor'
													strokeWidth='2'
													strokeLinecap='round'
													strokeLinejoin='round'
													role='img'
													aria-labelledby='checkmarkTitle2'
												>
													<title id='checkmarkTitle2'>Checkmark Icon</title>
													<polyline points='20 6 9 17 4 12' />
												</svg>
											</span>

											<span className='text-sm text-gray-500 sm:text-base'>
												Powerful <span className='font-bold'>filters/sorting and AI powered search</span>
											</span>
										</li>

										<li className='flex space-x-3'>
											<span className='mt-0.5 flex size-5 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-800/30 dark:text-blue-500'>
												<svg
													className='size-3.5 flex-shrink-0'
													xmlns='http://www.w3.org/2000/svg'
													width='24'
													height='24'
													viewBox='0 0 24 24'
													fill='none'
													stroke='currentColor'
													strokeWidth='2'
													strokeLinecap='round'
													strokeLinejoin='round'
													role='img'
													aria-labelledby='uniqueTitleId'
												>
													<title id='uniqueTitleId'>Generic Icon Description</title>
													<polyline points='20 6 9 17 4 12' />
												</svg>
											</span>

											<span className='text-sm text-gray-500 sm:text-base'>
												A recommendation engine and multi-person Link Room
											</span>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>

					<div className='mx-auto max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14'>
						<div className='mx-auto mb-10 max-w-2xl text-center transition-all lg:mb-14'>
							<h2 className='text-2xl font-bold text-gray-800 dark:text-gray-200 md:text-3xl md:leading-tight'>
								Frequently Asked Questions
							</h2>
						</div>

						<div className='mx-auto max-w-5xl transition-all'>
							<div className='grid gap-6 sm:grid-cols-2 md:gap-12'>
								<div>
									<h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200'>Is GamesLink free to use?</h3>
									<p className='mt-2 text-gray-600 dark:text-gray-400'>
										GamesLink offers a generous free tier experinece. We also offer paid features like the Link Room but we give
										you starter credits to try it out.
									</p>
								</div>

								<div>
									<h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200'>
										My team and I have credits. How do we use them?
									</h3>
									<p className='mt-2 text-gray-600 dark:text-gray-400'>
										The credits are used in the Link Room where a credit per person is used and link results are saved for future
										reference.
									</p>
								</div>

								<div>
									<h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200'>I do not see a game, can I add it?</h3>
									<p className='mt-2 text-gray-600 dark:text-gray-400'>
										While we have a big library of games, we do not have every game in the world. We are currently working on
										developing a system that allows users to submit games to be reviewed and added to the site.
									</p>
								</div>

								<div>
									<h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200'>
										Can I use GamesLink in a different language?
									</h3>
									<p className='mt-2 text-gray-600 dark:text-gray-400'>
										GamesLink is currently single region with English as the only language. We are currently working on making it
										accessible in other languages and give you the ability to get region specific recommendations.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

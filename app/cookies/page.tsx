import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Cookie Policy | GamesLink',
	description: 'Cookie Policy for GamesLink - Your place to find games to play with friends.',
}

export default function CookiePolicyPage() {
	return (
		<div className='container mx-auto py-12 px-4'>
			<h1 className='text-3xl font-bold mb-6'>Cookie Policy</h1>

			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>1. What Are Cookies</h2>
				<p className='mb-4'>
					Cookies are small pieces of text sent to your browser by a website you visit. They help that website remember information about
					your visit, which can both make it easier to visit the site again and make the site more useful to you.
				</p>
			</section>

			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>2. How We Use Cookies</h2>
				<p className='mb-4'>We use cookies and similar technologies for several purposes, including:</p>
				<ul className='list-disc pl-6 mb-4'>
					<li>Keeping you signed in</li>
					<li>Remembering your preferences and settings</li>
					<li>Understanding how you use our website</li>
					<li>Delivering personalized content and recommendations</li>
				</ul>
			</section>

			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>3. Types of Cookies We Use</h2>
				<p className='mb-4'>We use the following types of cookies:</p>
				<ul className='list-disc pl-6 mb-4'>
					<li>Essential cookies: These are cookies that are required for the operation of our website.</li>
					<li>
						Analytical/performance cookies: These allow us to recognize and count the number of visitors and to see how visitors move
						around our website when they are using it.
					</li>
					<li>Functionality cookies: These are used to recognize you when you return to our website.</li>
					<li>
						Targeting cookies: These cookies record your visit to our website, the pages you have visited and the links you have followed.
					</li>
				</ul>
			</section>

			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>4. Third-Party Cookies</h2>
				<p className='mb-4'>
					We may also use various third-parties cookies to report usage statistics of the Service, deliver advertisements on and through the
					Service, and so on. These cookies may be placed by services we use, such as Google Analytics or social media platforms.
				</p>
			</section>

			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>5. Managing Cookies</h2>
				<p className='mb-4'>
					Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how
					to see what cookies have been set, visit{' '}
					<a href='https://www.aboutcookies.org' className='text-blue-600 hover:underline'>
						www.aboutcookies.org
					</a>{' '}
					or{' '}
					<a href='https://www.allaboutcookies.org' className='text-blue-600 hover:underline'>
						www.allaboutcookies.org
					</a>
					.
				</p>
			</section>

			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>6. Changes to Our Cookie Policy</h2>
				<p className='mb-4'>
					We may update our Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this
					page.
				</p>
			</section>

			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>7. Contact Us</h2>
				<p className='mb-4'>If you have any questions about our Cookie Policy, please contact us at cookies@gameslink.com.</p>
			</section>
		</div>
	)
}

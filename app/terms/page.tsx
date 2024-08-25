import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Terms of Service | GamesLink',
	description: 'Terms of Service for GamesLink - Your place to find games to play with friends.',
}

export default function TermsOfServicePage() {
	return (
		<div className='container mx-auto py-12 px-4'>
			<h1 className='text-3xl font-bold mb-6'>Terms of Service</h1>

			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>1. Acceptance of Terms</h2>
				<p className='mb-4'>
					By accessing or using GamesLink, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do
					not use our service.
				</p>
			</section>

			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>2. Description of Service</h2>
				<p className='mb-4'>
					GamesLink is a platform that helps users discover games to play with friends. We offer features such as game browsing, filtering,
					sorting, and AI-powered search.
				</p>
			</section>

			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>3. User Accounts</h2>
				<p className='mb-4'>
					To access certain features of GamesLink, you may need to create an account. You are responsible for maintaining the
					confidentiality of your account information and for all activities that occur under your account.
				</p>
			</section>

			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>4. User Content</h2>
				<p className='mb-4'>
					Users may submit content, including comments and game ratings. You retain ownership of your content, but grant GamesLink a license
					to use, modify, and display it in connection with our service.
				</p>
			</section>

			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>5. Prohibited Conduct</h2>
				<p className='mb-4'>
					Users are prohibited from engaging in any unlawful or abusive behavior, including but not limited to posting offensive content,
					spamming, or attempting to gain unauthorized access to our systems.
				</p>
			</section>

			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>6. Intellectual Property</h2>
				<p className='mb-4'>
					All content and materials available on GamesLink, unless otherwise noted, are the property of GamesLink or its licensors and are
					protected by copyright and other intellectual property laws.
				</p>
			</section>

			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>7. Privacy</h2>
				<p className='mb-4'>
					Your use of GamesLink is also governed by our Privacy Policy. Please review our Privacy Policy to understand how we collect, use,
					and share your information.
				</p>
			</section>

			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>8. Termination</h2>
				<p className='mb-4'>
					We reserve the right to terminate or suspend your account and access to GamesLink at our sole discretion, without notice, for
					conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties, or for any other
					reason.
				</p>
			</section>

			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>9. Changes to Terms</h2>
				<p className='mb-4'>
					We may modify these Terms of Service at any time. We will notify you of any changes by posting the new Terms of Service on this
					page. Your continued use of GamesLink after any such changes constitutes your acceptance of the new Terms of Service.
				</p>
			</section>

			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>10. Contact Us</h2>
				<p className='mb-4'>If you have any questions about these Terms of Service, please contact us at support@gameslink.com.</p>
			</section>
		</div>
	)
}

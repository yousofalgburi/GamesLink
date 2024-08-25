import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Privacy Policy | GamesLink',
	description: 'Privacy Policy for GamesLink - Your place to find games to play with friends.',
}

export default function PrivacyPolicyPage() {
	return (
		<div className='container mx-auto py-12 px-4'>
			<h1 className='text-3xl font-bold mb-6'>Privacy Policy</h1>

			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>1. Information We Collect</h2>
				<p className='mb-4'>
					We collect information you provide directly to us when you create an account, such as your username and email address. We also
					collect information about your game preferences, including games you like or dislike, to provide personalized recommendations.
				</p>
			</section>

			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>2. How We Use Your Information</h2>
				<p className='mb-4'>We use the information we collect to provide, maintain, and improve our services, including:</p>
				<ul className='list-disc pl-6 mb-4'>
					<li>Personalizing game recommendations</li>
					<li>Facilitating the Link Room feature for multiplayer game suggestions</li>
					<li>Analyzing usage patterns to improve our service</li>
				</ul>
			</section>

			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>3. Information Sharing</h2>
				<p className='mb-4'>
					We do not sell your personal information. We may share aggregated, non-personal information for analytical purposes. Your game
					preferences may be visible to friends you connect with on the platform.
				</p>
			</section>

			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>4. Data Security</h2>
				<p className='mb-4'>
					We implement reasonable security measures to protect your personal information. However, no method of transmission over the
					Internet is 100% secure, and we cannot guarantee absolute security.
				</p>
			</section>

			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>5. Cookies and Similar Technologies</h2>
				<p className='mb-4'>
					We use cookies and similar technologies to enhance your experience on our platform. You can manage your cookie preferences through
					your browser settings.
				</p>
			</section>

			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>6. Third-Party Links</h2>
				<p className='mb-4'>
					Our service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third
					parties.
				</p>
			</section>

			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>7. Children's Privacy</h2>
				<p className='mb-4'>
					Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
				</p>
			</section>

			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>8. Changes to This Privacy Policy</h2>
				<p className='mb-4'>
					We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this
					page.
				</p>
			</section>

			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-4'>9. Contact Us</h2>
				<p className='mb-4'>If you have any questions about this Privacy Policy, please contact us at privacy@gameslink.com.</p>
			</section>
		</div>
	)
}

export async function GET(req, res) {
	if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
		return res.status(401).end('Unauthorized')
	}

	const result = await fetch('http://worldtimeapi.org/api/timezone/America/Chicago', {
		cache: 'no-store',
	})
	const data = await result.json()

	return Response.json({ datetime: data.datetime })
}

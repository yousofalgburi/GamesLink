'use client'

import { api } from '@frontend/lib/api'
import { useEffect, useState } from 'react'

export default function Home() {
	const [message, setMessage] = useState('')

	useEffect(() => {
		async function fetchMessage() {
			const res = await api.test.$get()
			const data = await res.json()
			console.log(data)
			setMessage(data.message)
		}

		fetchMessage()
	}, [])

	return <>{message}</>
}

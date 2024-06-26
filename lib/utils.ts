import { type ClassValue, clsx } from 'clsx'
import { formatDistanceToNowStrict } from 'date-fns'
import locale from 'date-fns/locale/en-US'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

const formatDistanceLocale = {
	lessThanXSeconds: 'just now',
	xSeconds: 'just now',
	halfAMinute: 'just now',
	lessThanXMinutes: '{{count}}m',
	xMinutes: '{{count}}m',
	aboutXHours: '{{count}}h',
	xHours: '{{count}}h',
	xDays: '{{count}}d',
	aboutXWeeks: '{{count}}w',
	xWeeks: '{{count}}w',
	aboutXMonths: '{{count}}m',
	xMonths: '{{count}}m',
	aboutXYears: '{{count}}y',
	xYears: '{{count}}y',
	overXYears: '{{count}}y',
	almostXYears: '{{count}}y',
}

function formatDistance(token: string, count: number, options?: { addSuffix?: boolean; comparison?: number }): string {
	const opts = options || {}

	const result = formatDistanceLocale[token as keyof typeof formatDistanceLocale].replace('{{count}}', count.toString())

	if (opts.addSuffix) {
		if (opts.comparison && opts.comparison > 0) {
			return `in ${result}`
		}

		if (result === 'just now') return result
		return `${result} ago`
	}

	return result
}

export function formatTimeToNow(date: Date): string {
	return formatDistanceToNowStrict(date, {
		addSuffix: true,
		locale: {
			...locale,
			formatDistance,
		},
	})
}

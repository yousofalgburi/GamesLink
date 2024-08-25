import { NextResponse } from 'next/server'
import { db } from '@/db'
import { processedGames } from '@/db/schema/game'
import { and, eq, sql } from 'drizzle-orm'
import OpenAI from 'openai'
import puppeteer from 'puppeteer'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

function estimateTokenCount(text: string): number {
	return Math.ceil(text.length / 4)
}

function truncateToTokenLimit(text: string, limit: number): string {
	const words = text.split(/\s+/)
	let tokenCount = 0
	let truncatedText = ''

	for (const word of words) {
		const wordTokens = estimateTokenCount(`${word} `)
		if (tokenCount + wordTokens > limit) break
		truncatedText += `${word} `
		tokenCount += wordTokens
	}

	return truncatedText.trim()
}

async function fetchGameInfoFromWikipedia(gameName: string): Promise<string> {
	const browser = await puppeteer.launch({
		headless: true,
		executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	})
	const page = await browser.newPage()

	try {
		await page.goto(`https://www.google.com/search?q=${encodeURIComponent(`${gameName} game wikipedia`)}`)
		await page.waitForSelector('div#search')

		const wikipediaLink = await page.$('a[href*="wikipedia.org"]')
		if (!wikipediaLink) {
			console.warn(`No Wikipedia link found for ${gameName}`)
			return ''
		}

		await wikipediaLink.click()
		await page.waitForNavigation()

		const content = await page.evaluate(() => {
			const articleContent = document.querySelector('.mw-parser-output')
			if (!articleContent) return ''

			const unwantedSelectors = ['.mw-empty-elt', '.mw-editsection', '.noprint', 'style', 'script', '.reference', '.reflist']
			for (const selector of unwantedSelectors) {
				for (const el of articleContent.querySelectorAll(selector)) {
					el.remove()
				}
			}

			return articleContent.textContent || ''
		})

		return content.trim()
	} catch (error) {
		console.error(`Error fetching info for ${gameName}:`, error)
		return ''
	} finally {
		await browser.close()
	}
}

async function createEmbeddingWithRetry(gameInfo: string, maxRetries = 3): Promise<number[]> {
	let currentInfo = gameInfo
	let retries = 0

	while (retries < maxRetries) {
		try {
			const embeddingResponse = await openai.embeddings.create({
				model: 'text-embedding-3-large',
				input: currentInfo,
				dimensions: 3072,
			})
			return embeddingResponse.data[0].embedding
		} catch (error: unknown) {
			if (typeof error === 'object' && error !== null && 'error' in error) {
				const openAIError = error as { error?: { type?: string; message?: string } }
				if (openAIError.error?.type === 'invalid_request_error' && openAIError.error?.message?.includes('maximum context length')) {
					console.warn(`Truncating game info and retrying. Attempt ${retries + 1}`)
					const currentTokens = estimateTokenCount(currentInfo)
					const newLimit = Math.floor(currentTokens * 0.9)
					currentInfo = truncateToTokenLimit(currentInfo, newLimit)
					retries++
				} else {
					throw error
				}
			} else {
				throw error
			}
		}
	}

	throw new Error('Failed to create embedding after maximum retries')
}

export async function POST(request: Request) {
	const { token } = await request.json()

	if (token !== process.env.PRIVATE_API_TOKEN) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	try {
		const gamesToProcess = await db
			.select({
				id: processedGames.id,
				name: processedGames.name,
			})
			.from(processedGames)
			.where(and(sql`${processedGames.embedding} IS NULL`, eq(processedGames.type, 'game'), sql`${processedGames.nsfw} = false`))
			.limit(1000)

		for (const game of gamesToProcess) {
			let gameInfo = await fetchGameInfoFromWikipedia(game.name)

			const MAX_TOKENS = 7000
			if (estimateTokenCount(gameInfo) > MAX_TOKENS) {
				gameInfo = truncateToTokenLimit(gameInfo, MAX_TOKENS)
			}

			if (gameInfo) {
				try {
					const embedding = await createEmbeddingWithRetry(gameInfo)
					await db.update(processedGames).set({ embedding }).where(eq(processedGames.id, game.id))
				} catch (error) {
					console.error(`Failed to create embedding for game: ${game.name}`, error)
				}
			} else {
				console.warn(`No Wikipedia information found for game: ${game.name}`)
			}
		}

		return NextResponse.json({ success: true, processed: gamesToProcess.length })
	} catch (error) {
		console.error('Error generating embeddings:', error)
		return NextResponse.json({ error: 'Failed to generate embeddings' }, { status: 500 })
	}
}

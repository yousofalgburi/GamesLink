import { Pinecone } from '@pinecone-database/pinecone'

// create new Pinecone instance
const pc = new Pinecone({
	apiKey: process.env.PINECONE_API_KEY || '',
})

const index = pc.index('steam-games')

export default index

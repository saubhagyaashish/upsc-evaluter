import type { AIProvider } from './aiProvider'
import { OpenAIProvider } from './providers/openaiProvider'
import { GeminiProvider } from './providers/geminiProvider'

export function getAIProvider(): AIProvider {
    const provider = process.env.AI_PROVIDER?.toLowerCase() || 'openai'

    console.log(`🤖 Using AI provider: ${provider}`)

    switch (provider) {
        case 'gemini':
            if (!process.env.GEMINI_API_KEY) {
                throw new Error('GEMINI_API_KEY is not set in environment variables')
            }
            return new GeminiProvider()

        case 'openai':
            if (!process.env.OPENAI_API_KEY) {
                throw new Error('OPENAI_API_KEY is not set in environment variables')
            }
            return new OpenAIProvider()

        default:
            console.warn(`Unknown AI provider: ${provider}, defaulting to OpenAI`)
            return new OpenAIProvider()
    }
}

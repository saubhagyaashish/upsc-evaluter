import { OCRProvider } from './ocrProvider'
import { OpenAIOCRProvider } from './providers/openaiOCRProvider'
import { GeminiOCRProvider } from './providers/geminiOCRProvider'

export function getOCRProvider(): OCRProvider {
    const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase()

    console.log(`🔍 Using OCR provider: ${provider}`)

    switch (provider) {
        case 'gemini':
            if (!process.env.GEMINI_API_KEY) {
                throw new Error('GEMINI_API_KEY is not set in environment variables')
            }
            return new GeminiOCRProvider()

        case 'openai':
        default:
            if (!process.env.OPENAI_API_KEY) {
                throw new Error('OPENAI_API_KEY is not set in environment variables')
            }
            return new OpenAIOCRProvider()
    }
}

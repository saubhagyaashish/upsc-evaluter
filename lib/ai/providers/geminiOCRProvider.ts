import { GoogleGenerativeAI } from '@google/generative-ai'
import { OCRProvider } from '../ocrProvider'

export class GeminiOCRProvider implements OCRProvider {
    private client: GoogleGenerativeAI
    private model: any

    constructor() {
        this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
        this.model = this.client.getGenerativeModel({
            model: 'gemini-2.0-flash', // Using the latest flash model
        })
    }

    async extractQuestionFromImage(imageUrl: string): Promise<string> {
        try {
            // Fetch the image
            const imageResponse = await fetch(imageUrl)
            const imageBuffer = await imageResponse.arrayBuffer()
            const base64Image = Buffer.from(imageBuffer).toString('base64')

            const prompt = `Extract only the question text from this UPSC answer sheet. The question is usually at the top of the sheet. Return only the question text, nothing else.`

            const result = await this.model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: imageResponse.headers.get('content-type') || 'image/jpeg',
                    },
                },
            ])

            const response = await result.response
            return response.text()
        } catch (error) {
            console.error('Error extracting question from image with Gemini:', error)
            throw new Error('Failed to extract question from image')
        }
    }

    async extractTextFromImage(imageUrl: string): Promise<string> {
        try {
            // Fetch the image
            const imageResponse = await fetch(imageUrl)
            const imageBuffer = await imageResponse.arrayBuffer()
            const base64Image = Buffer.from(imageBuffer).toString('base64')

            const prompt = `Extract all the handwritten text from this answer sheet image and format it beautifully using markdown.

Formatting guidelines:
- Use **bold** for important points and headings
- Use proper headings (##, ###) for different sections
- Use bullet points (-) or numbered lists where appropriate
- Preserve the logical structure and flow of the answer
- Keep paragraphs properly separated with blank lines
- DO NOT wrap the text in code blocks (no \`\`\` marks)
- Format it as readable prose with proper markdown elements

Return ONLY the formatted text, nothing else.`

            const result = await this.model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: imageResponse.headers.get('content-type') || 'image/jpeg',
                    },
                },
            ])

            const response = await result.response
            return response.text()
        } catch (error) {
            console.error('Error extracting text from image with Gemini:', error)
            throw new Error('Failed to extract text from image')
        }
    }
}

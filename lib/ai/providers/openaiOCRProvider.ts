import OpenAI from 'openai'
import { OCRProvider } from '../ocrProvider'

export class OpenAIOCRProvider implements OCRProvider {
    private client: OpenAI

    constructor() {
        this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY!,
        })
    }

    async extractQuestionFromImage(imageUrl: string): Promise<string> {
        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-4o-mini', // Using mini for cost efficiency
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'Extract only the question text from this UPSC answer sheet. The question is usually at the top of the sheet. Return only the question text, nothing else.',
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: imageUrl,
                                },
                            },
                        ],
                    },
                ],
                max_tokens: 300,
            })

            return response.choices[0]?.message?.content || ''
        } catch (error) {
            console.error('Error extracting question from image with OpenAI:', error)
            throw new Error('Failed to extract question from image')
        }
    }

    async extractTextFromImage(imageUrl: string): Promise<string> {
        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `Extract all the handwritten text from this answer sheet image and format it beautifully using markdown.

Formatting guidelines:
- Use **bold** for important points and headings
- Use proper headings (##, ###) for different sections
- Use bullet points (-) or numbered lists where appropriate
- Preserve the logical structure and flow of the answer
- Keep paragraphs properly separated with blank lines
- DO NOT wrap the text in code blocks (no \`\`\` marks)
- Format it as readable prose with proper markdown elements

Return ONLY the formatted text, nothing else.`,
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: imageUrl,
                                },
                            },
                        ],
                    },
                ],
                max_tokens: 1000,
            })

            return response.choices[0]?.message?.content || ''
        } catch (error) {
            console.error('Error extracting text from image with OpenAI:', error)
            throw new Error('Failed to extract text from image')
        }
    }
}

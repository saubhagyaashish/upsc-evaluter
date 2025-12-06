import { NextRequest, NextResponse } from 'next/server'
import { getOCRProvider } from '@/lib/ai/ocrProviderFactory'

export async function POST(request: NextRequest) {
    try {
        const { imageUrl } = await request.json()

        if (!imageUrl) {
            return NextResponse.json({ error: 'Image URL required' }, { status: 400 })
        }

        const ocrProvider = getOCRProvider()
        const question = await ocrProvider.extractQuestionFromImage(imageUrl)

        return NextResponse.json({ question })
    } catch (error: any) {
        console.error('Question extraction error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to extract question' },
            { status: 500 }
        )
    }
}

import { NextRequest, NextResponse } from 'next/server'
import { extractQuestionFromImage } from '@/lib/openai/vision'

export async function POST(request: NextRequest) {
    try {
        const { imageUrl } = await request.json()

        if (!imageUrl) {
            return NextResponse.json({ error: 'Image URL required' }, { status: 400 })
        }

        const question = await extractQuestionFromImage(imageUrl)

        return NextResponse.json({ question })
    } catch (error: any) {
        console.error('Question extraction error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to extract question' },
            { status: 500 }
        )
    }
}

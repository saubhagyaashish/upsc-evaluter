import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOCRProvider } from '@/lib/ai/ocrProviderFactory'
import { getAIProvider } from '@/lib/ai/providerFactory'

export async function POST(request: NextRequest) {
    try {
        const { answerId } = await request.json()

        if (!answerId) {
            return NextResponse.json({ error: 'Answer ID required' }, { status: 400 })
        }

        const supabase = await createClient()

        // Get the answer details
        const { data: answer, error: answerError } = await supabase
            .from('answers')
            .select('*')
            .eq('id', answerId)
            .single()

        if (answerError || !answer) {
            return NextResponse.json({ error: 'Answer not found' }, { status: 404 })
        }

        // Parse image URLs (single string or JSON array for multi-page)
        let imageUrls: string[] = []
        try {
            // Try to parse as JSON array first (multi-page)
            const parsed = JSON.parse(answer.image_url)
            imageUrls = Array.isArray(parsed) ? parsed : [answer.image_url]
        } catch {
            // If parsing fails, it's a single URL (backward compatibility)
            imageUrls = [answer.image_url]
        }

        console.log('==================== EVALUATION START ====================')
        console.log('Answer ID:', answerId)
        console.log('Number of pages:', imageUrls.length)
        console.log('Image URLs:', imageUrls)

        // Extract text from image(s) using OCR provider (OpenAI or Gemini)
        const ocrProvider = getOCRProvider()
        console.log('OCR Provider:', ocrProvider.constructor.name)
        let extractedText = ''

        if (imageUrls.length === 1) {
            // Single page
            console.log('Processing single page...')
            extractedText = await ocrProvider.extractTextFromImage(imageUrls[0])
        } else {
            // Multiple pages - extract and combine with page markers
            console.log('Processing multiple pages...')
            const pageTexts = await Promise.all(
                imageUrls.map((url, index) =>
                    ocrProvider.extractTextFromImage(url)
                        .then(text => {
                            console.log(`Page ${index + 1} OCR complete (${text.length} chars)`)
                            return `## 📄 Page ${index + 1}\n\n${text}`
                        })
                )
            )
            extractedText = pageTexts.join('\n\n---\n\n')
        }

        console.log('\n========== EXTRACTED TEXT (Total: ' + extractedText.length + ' chars) ==========')
        console.log(extractedText)
        console.log('========== END EXTRACTED TEXT ==========\n')

        // Update answer with extracted text
        await supabase
            .from('answers')
            .update({ extracted_text: extractedText })
            .eq('id', answerId)

        // Get word limit (default 250)
        let wordLimit = 250
        if (answer.question_id) {
            const { data: questionData } = await supabase
                .from('questions')
                .select('word_limit')
                .eq('id', answer.question_id)
                .single()

            if (questionData) {
                wordLimit = questionData.word_limit
            }
        }

        // Evaluate the answer using AI provider (OpenAI or Gemini)
        const aiProvider = getAIProvider()
        console.log('AI Provider:', aiProvider.constructor.name)
        console.log('Question:', answer.question_text)
        console.log('Word limit:', wordLimit)
        console.log('\nCalling AI for evaluation...')

        const evaluation = await aiProvider.evaluateAnswer(
            answer.question_text,
            extractedText,
            wordLimit
        )

        console.log('\n========== AI EVALUATION RESULT ==========')
        console.log('Score:', evaluation.score)
        console.log('Structure Feedback:', evaluation.structureFeedback)
        console.log('Points Missed:', evaluation.pointsMissed)
        console.log('Suggestions:', evaluation.suggestions)
        console.log('========== END AI RESULT ==========')

        // Save evaluation to database
        const { data: evaluationData, error: evalError } = await supabase
            .from('evaluations')
            .insert({
                answer_id: answerId,
                score: evaluation.score,
                structure_feedback: evaluation.structureFeedback,
                points_missed: evaluation.pointsMissed,
                suggestions: evaluation.suggestions,
            })
            .select()
            .single()

        if (evalError) {
            return NextResponse.json({ error: 'Failed to save evaluation' }, { status: 500 })
        }

        console.log('\nEvaluation saved to database successfully!')
        console.log('==================== EVALUATION END ====================\n')

        return NextResponse.json({
            success: true,
            evaluation: evaluationData,
        })
    } catch (error: any) {
        console.error('Evaluation error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to evaluate answer' },
            { status: 500 }
        )
    }
}

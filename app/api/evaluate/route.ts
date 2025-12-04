import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractTextFromImage } from '@/lib/openai/vision'
import { evaluateAnswer } from '@/lib/openai/evaluator'

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

        // Extract text from image using OpenAI Vision
        const extractedText = await extractTextFromImage(answer.image_url)

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

        // Evaluate the answer
        const evaluation = await evaluateAnswer(
            answer.question_text,
            extractedText,
            wordLimit
        )

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

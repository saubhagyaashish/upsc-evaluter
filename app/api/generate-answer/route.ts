import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateUPSCAnswer } from '@/lib/openai/answerGenerator'

export async function POST(request: NextRequest) {
    try {
        const { questionText, category, wordLimit } = await request.json()

        if (!questionText || !questionText.trim()) {
            return NextResponse.json(
                { error: 'Question text is required' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Get authenticated user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check daily limit using function
        const { data: canGenerate, error: limitError } = await supabase.rpc(
            'check_daily_generation_limit',
            { p_user_id: user.id }
        )

        if (limitError) {
            console.error('Error checking limit:', limitError)
        }

        if (canGenerate === false) {
            return NextResponse.json(
                { error: 'Daily limit reached (3 answers/day). Upgrade to premium for unlimited access!' },
                { status: 429 }
            )
        }

        // Normalize question for caching
        const normalizedQuestion = questionText.trim().toLowerCase()

        // Check if answer already exists (cache hit!)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: cachedAnswer } = await supabase
            .from('generated_answers')
            .select('*')
            .eq('question_text', normalizedQuestion)
            .gte('created_at', thirtyDaysAgo.toISOString())
            .single()

        let generatedAnswerId: string

        if (cachedAnswer) {
            // Cache hit! Update access count and time
            await supabase
                .from('generated_answers')
                .update({
                    last_accessed_at: new Date().toISOString(),
                    access_count: (cachedAnswer.access_count || 1) + 1,
                })
                .eq('id', cachedAnswer.id)

            generatedAnswerId = cachedAnswer.id
        } else {
            // Generate new answer with AI
            const answer = await generateUPSCAnswer(
                questionText,
                category || 'GS1',
                wordLimit || 250
            )

            // Combine all parts into full answer text
            const answerText = `${answer.introduction}\n\n${answer.body.map(
                (point) => `${point.heading}\n${point.content}`
            ).join('\n\n')}\n\n${answer.conclusion}`

            // Save to database
            const { data: savedAnswer, error: saveError } = await supabase
                .from('generated_answers')
                .insert({
                    question_text: normalizedQuestion,
                    category: category || 'GS1',
                    word_limit: wordLimit || 250,
                    answer_text: answerText,
                    introduction: answer.introduction,
                    body_points: answer.body,
                    conclusion: answer.conclusion,
                    mark_worthy_points: answer.mark_worthy_points,
                    word_count: answer.word_count,
                    confidence_score: answer.confidence,
                })
                .select()
                .single()

            if (saveError) {
                console.error('Error saving answer:', saveError)
                throw saveError
            }

            generatedAnswerId = savedAnswer.id
        }

        // Track this request
        await supabase.from('generation_requests').insert({
            user_id: user.id,
            generated_answer_id: generatedAnswerId,
            question_text: questionText,
        })

        // Fetch the complete answer to return
        const { data: finalAnswer } = await supabase
            .from('generated_answers')
            .select('*')
            .eq('id', generatedAnswerId)
            .single()

        return NextResponse.json({
            success: true,
            answer: finalAnswer,
            cached: !!cachedAnswer,
        })
    } catch (error: any) {
        console.error('Error in generate-answer API:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to generate answer' },
            { status: 500 }
        )
    }
}

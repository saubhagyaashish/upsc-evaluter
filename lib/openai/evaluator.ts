import OpenAI from 'openai'

function getOpenAIClient() {
    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY!,
    })
}

export interface EvaluationResult {
    score: number
    structureFeedback: string
    pointsMissed: string[]
    suggestions: string
}

export async function evaluateAnswer(
    questionText: string,
    answerText: string,
    wordLimit: number = 250
): Promise<EvaluationResult> {
    try {
        const openai = getOpenAIClient()
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert UPSC Mains examiner with years of experience. Evaluate answers based on UPSC standards.
          
Evaluation Criteria:
1. Content Accuracy and Depth (30%) - Factual correctness, depth of analysis, use of examples
2. Structure (25%) - Clear Introduction, well-organized Body, strong Conclusion
3. Keywords and Technical Terms (20%) - Appropriate use of UPSC-relevant terminology
4. Length Appropriateness (15%) - Word limit adherence (target: ${wordLimit} words)
5. Balanced Argumentation (10%) - Multiple perspectives, balanced view

Your response MUST be a valid JSON object with this exact structure:
{
  "score": <number between 0-10>,
  "structureFeedback": "<detailed feedback on structure>",
  "pointsMissed": ["<point 1>", "<point 2>", ...],
  "suggestions": "<specific actionable suggestions for improvement>"
}`,
                },
                {
                    role: 'user',
                    content: `Question: ${questionText}

Answer: ${answerText}

Please evaluate this UPSC Mains answer and provide detailed feedback.`,
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
        })

        const result = JSON.parse(response.choices[0]?.message?.content || '{}')

        return {
            score: result.score || 0,
            structureFeedback: result.structureFeedback || '',
            pointsMissed: result.pointsMissed || [],
            suggestions: result.suggestions || '',
        }
    } catch (error) {
        console.error('Error evaluating answer:', error)
        throw new Error('Failed to evaluate answer')
    }
}

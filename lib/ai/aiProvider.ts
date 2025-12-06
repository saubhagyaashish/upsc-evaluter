export interface MarkWorthyPoint {
    position: number
    type: 'MUST-WRITE' | 'HIGH-VALUE' | 'GOOD-TO-HAVE' | 'DATA'
    text: string
    explanation: string
    marks_value: number
}

export interface BodyPoint {
    heading: string
    content: string
    mark_worthy: string
    explanation: string
}

export interface GeneratedAnswer {
    introduction: string
    body: BodyPoint[]
    conclusion: string
    word_count: number
    confidence: number
    mark_worthy_points: MarkWorthyPoint[]
}

export interface EvaluationResult {
    score: number
    structureFeedback: string
    pointsMissed: string[]
    suggestions: string
}

// AI Provider Interface - implemented by OpenAI, Gemini, etc.
export interface AIProvider {
    generateAnswer(
        questionText: string,
        category?: string,
        wordLimit?: number
    ): Promise<GeneratedAnswer>

    evaluateAnswer(
        questionText: string,
        answerText: string,
        wordLimit?: number
    ): Promise<EvaluationResult>
}

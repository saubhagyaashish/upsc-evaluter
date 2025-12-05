// Common interface and types for AI providers

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
    mark_worthy: 'MUST-WRITE' | 'HIGH-VALUE' | 'GOOD-TO-HAVE' | 'DATA'
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

export interface AIProvider {
    generateAnswer(
        questionText: string,
        category: string,
        wordLimit: number
    ): Promise<GeneratedAnswer>
}

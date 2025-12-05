import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AIProvider, GeneratedAnswer, BodyPoint, MarkWorthyPoint } from '../aiProvider'

export class GeminiProvider implements AIProvider {
    private client: GoogleGenerativeAI
    private model: any

    constructor() {
        this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
        this.model = this.client.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                temperature: 0.7,
                responseMimeType: 'application/json',
            },
        })
    }

    async generateAnswer(
        questionText: string,
        category: string = 'GS1',
        wordLimit: number = 250
    ): Promise<GeneratedAnswer> {
        const prompt = this.buildPrompt(questionText, category, wordLimit)

        try {
            const result = await this.model.generateContent(prompt)
            const response = await result.response
            const text = response.text()

            // Parse JSON response
            const parsed = JSON.parse(text)

            // Extract mark-worthy points from body
            const markWorthyPoints: MarkWorthyPoint[] = parsed.body.map((point: BodyPoint, index: number) => ({
                position: index,
                type: point.mark_worthy,
                text: point.heading,
                explanation: point.explanation,
                marks_value: this.getMarksValue(point.mark_worthy),
            }))

            return {
                introduction: parsed.introduction || '',
                body: parsed.body || [],
                conclusion: parsed.conclusion || '',
                word_count: parsed.word_count || 0,
                confidence: parsed.confidence || 0.8,
                mark_worthy_points: markWorthyPoints,
            }
        } catch (error) {
            console.error('Error generating answer with Gemini:', error)
            throw new Error('Failed to generate answer')
        }
    }

    private buildPrompt(questionText: string, category: string, wordLimit: number): string {
        return `You are an expert UPSC Mains examiner and topper who writes model answers.

UPSC ANSWER RULES:
1. Structure: Introduction (10%) → Body (75%) → Conclusion (15%)
2. Word limit: EXACTLY ${wordLimit} words (±10 words)
3. Include: Facts, data, examples, current affairs (2023-2024)
4. Use: Clear subheadings, bullet points, multi-dimensional analysis
5. Style: Formal, concise, balanced perspectives

CATEGORY-SPECIFIC GUIDELINES for ${category}:
${this.getCategoryGuidelines(category)}

MARK-WORTHY POINT TYPES:
- MUST-WRITE: Essential for passing marks (definitions, direct answer, India-specific impact, way forward)
- HIGH-VALUE: Bonus marks showing depth (recent data 2023-24, multiple perspectives, specific examples)
- GOOD-TO-HAVE: Enhances answer quality (historical context, global comparisons, additional dimensions)
- DATA: Facts and statistics that strengthen arguments (committee reports, statistics, SC judgments)

RESPONSE FORMAT (JSON):
{
  "introduction": "2-3 line introduction with context/definition/relevance",
  "body": [
    {
      "heading": "Clear Subheading",
      "content": "Detailed explanation with examples and data. Use bullet points for clarity.",
      "mark_worthy": "MUST-WRITE" | "HIGH-VALUE" | "GOOD-TO-HAVE" | "DATA",
      "explanation": "Why this specific point earns marks (be specific)"
    }
  ],
  "conclusion": "2-3 line summary with way forward/optimistic outlook",
  "word_count": 248,
  "confidence": 0.9
}

Question: ${questionText}

Generate a UPSC model answer with clear marking guidance. Be specific about WHY each point earns marks. Return ONLY valid JSON, nothing else.`
    }

    private getCategoryGuidelines(category: string): string {
        const guidelines: Record<string, string> = {
            GS1: `History/Culture/Society:
- Include historical timeline and chronological flow
- Cultural significance and social impact
- Examples: Freedom fighters, monuments, social movements, art forms
- Tone: Narrative with analytical depth
- Must have: Cause-effect relationships, India's diversity perspective`,

            GS2: `Governance/Polity/International Relations:
- Constitutional provisions, articles, amendments
- Government schemes, policies, recent acts
- Supreme Court judgments and committee recommendations
- Tone: Analytical and solution-oriented
- Must have: Legal framework, implementation challenges, way forward`,

            GS3: `Economy/Science & Technology/Environment:
- Statistical data, economic indicators, budget allocations
- Technical details where relevant
- Government reports (Economic Survey, NITI Aayog)
- Tone: Data-driven, evidence-based
- Must have: Numbers, current status, policy measures, outcomes`,

            GS4: `Ethics/Integrity/Aptitude:
- Philosophical perspectives and ethical frameworks
- Case study analysis with stakeholder perspectives
- Real-life examples and moral dilemmas
- Tone: Balanced, empathetic, principle-based
- Must have: Multiple viewpoints, ethical analysis, recommended resolution`,

            Essay: `Essay Writing:
- Clear thesis statement in introduction
- Balanced arguments (for and against where applicable)
- Examples from various domains (social, economic, political, cultural)
- Quotes from eminent personalities
- Tone: Thoughtful, balanced, visionary
- Must have: Original insights, coherent flow, strong conclusion with vision`,
        }

        return guidelines[category] || guidelines.GS1
    }

    private getMarksValue(type: string): number {
        const values: Record<string, number> = {
            'MUST-WRITE': 2.0,
            'HIGH-VALUE': 1.5,
            'GOOD-TO-HAVE': 1.0,
            DATA: 1.5,
        }
        return values[type] || 1.0
    }
}

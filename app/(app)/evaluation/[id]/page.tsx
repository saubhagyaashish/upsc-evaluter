'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Database } from '@/lib/types/database.types'
import { ArrowLeft, RefreshCw } from 'lucide-react'

type Answer = Database['public']['Tables']['answers']['Row']
type Evaluation = Database['public']['Tables']['evaluations']['Row']

interface EvaluationData {
    answer: Answer
    evaluation: Evaluation
}

export default function EvaluationPage() {
    const params = useParams()
    const router = useRouter()
    const answerId = params.id as string

    const [data, setData] = useState<EvaluationData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchEvaluation() {
            try {
                const supabase = createClient()

                const { data: answer, error: answerError } = await supabase
                    .from('answers')
                    .select('*')
                    .eq('id', answerId)
                    .single()

                if (answerError) throw answerError

                const { data: evaluation, error: evalError } = await supabase
                    .from('evaluations')
                    .select('*')
                    .eq('answer_id', answerId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single()

                if (evalError) throw evalError

                setData({ answer, evaluation })
            } catch (err: any) {
                setError(err.message || 'Failed to load evaluation')
            } finally {
                setLoading(false)
            }
        }

        fetchEvaluation()
    }, [answerId])

    const getScoreColor = (score: number) => {
        if (score >= 8) return 'bg-green-500'
        if (score >= 6) return 'bg-yellow-500'
        if (score >= 4) return 'bg-orange-500'
        return 'bg-red-500'
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="max-w-4xl mx-auto">
                <Card className="p-8 bg-red-500/10 border-red-500 text-center">
                    <p className="text-red-400 mb-4">{error || 'Evaluation not found'}</p>
                    <Button onClick={() => router.push('/dashboard')}>
                        Go to Dashboard
                    </Button>
                </Card>
            </div>
        )
    }

    const { answer, evaluation } = data

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/history')}
                    className="text-white hover:bg-white/10"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to History
                </Button>
            </div>

            {/* Score Card */}
            <Card className="p-8 bg-white/10 backdrop-blur-lg border-white/20 mb-6">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-slate-300 mb-4">Your Score</h2>
                    <div className="relative inline-block">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                            <div className="w-28 h-28 rounded-full bg-slate-900 flex items-center justify-center">
                                <span className="text-5xl font-bold text-white">
                                    {evaluation.score}
                                    <span className="text-2xl text-slate-400">/10</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <Badge className={`${getScoreColor(evaluation.score)} text-white px-4 py-1`}>
                            {evaluation.score >= 8 ? 'Excellent' : evaluation.score >= 6 ? 'Good' : evaluation.score >= 4 ? 'Average' : 'Needs Improvement'}
                        </Badge>
                    </div>
                </div>
            </Card>

            {/* Question */}
            <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20 mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Question</h3>
                <p className="text-slate-300">{answer.question_text}</p>
                <div className="mt-2">
                    <Badge variant="outline" className="text-purple-400 border-purple-400">
                        Source: {answer.question_source}
                    </Badge>
                </div>
            </Card>

            {/* Answer Image */}
            <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Your Answer</h3>
                <img
                    src={answer.image_url}
                    alt="Answer sheet"
                    className="w-full rounded-lg border-2 border-purple-500"
                />
            </Card>

            {/* Extracted Text */}
            {answer.extracted_text && (
                <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20 mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Extracted Text</h3>
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                        <p className="text-slate-300 whitespace-pre-wrap">{answer.extracted_text}</p>
                    </div>
                </Card>
            )}

            {/* Structure Feedback */}
            {evaluation.structure_feedback && (
                <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20 mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Structure Feedback</h3>
                    <p className="text-slate-300">{evaluation.structure_feedback}</p>
                </Card>
            )}

            {/* Points Missed */}
            {evaluation.points_missed && evaluation.points_missed.length > 0 && (
                <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20 mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Points You Missed</h3>
                    <ul className="space-y-2">
                        {evaluation.points_missed.map((point, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-red-400 mr-2">•</span>
                                <span className="text-slate-300">{point}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}

            {/* Suggestions */}
            {evaluation.suggestions && (
                <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20 mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Suggestions for Improvement</h3>
                    <p className="text-slate-300">{evaluation.suggestions}</p>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
                <Button
                    onClick={() => router.push('/upload')}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                    Upload Another Answer
                </Button>
                <Button
                    variant="outline"
                    onClick={() => router.push('/history')}
                    className="flex-1 border-purple-600 text-purple-400 hover:bg-purple-600/10"
                >
                    View All Answers
                </Button>
            </div>
        </div>
    )
}

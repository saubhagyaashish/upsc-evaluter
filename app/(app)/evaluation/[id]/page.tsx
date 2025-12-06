'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Database } from '@/lib/types/database.types'
import { ArrowLeft, RefreshCw, Lightbulb, Sparkles, BookOpen } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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

    // Model answer state
    const [modelAnswer, setModelAnswer] = useState<any | null>(null)
    const [loadingModelAnswer, setLoadingModelAnswer] = useState(false)
    const [modelAnswerError, setModelAnswerError] = useState<string | null>(null)
    const [showModelAnswer, setShowModelAnswer] = useState(false)

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

    const handleGenerateModelAnswer = async () => {
        if (!data) return

        setLoadingModelAnswer(true)
        setModelAnswerError(null)

        try {
            const response = await fetch('/api/generate-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionText: data.answer.question_text,
                    category: 'GS1',
                    wordLimit: 250,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to generate model answer')
            }

            const result = await response.json()
            setModelAnswer(result.answer)
            setShowModelAnswer(true)
        } catch (err: any) {
            setModelAnswerError(err.message)
        } finally {
            setLoadingModelAnswer(false)
        }
    }

    // Parse image URLs for multi-page display
    const getImageUrls = (imageUrl: string): string[] => {
        try {
            const parsed = JSON.parse(imageUrl)
            return Array.isArray(parsed) ? parsed : [imageUrl]
        } catch {
            return [imageUrl]
        }
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
    const imageUrls = getImageUrls(answer.image_url)

    return (
        <div className="max-w-4xl mx-auto px-4">
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

            {/* Answer Images */}
            <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                    Your Answer {imageUrls.length > 1 && `(${imageUrls.length} pages)`}
                </h3>
                {imageUrls.length === 1 ? (
                    <img
                        src={imageUrls[0]}
                        alt="Answer sheet"
                        className="w-full rounded-lg border-2 border-purple-500"
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {imageUrls.map((url, index) => (
                            <div key={index} className="relative">
                                <Badge className="absolute top-2 left-2 bg-blue-600 text-white z-10">
                                    Page {index + 1}
                                </Badge>
                                <img
                                    src={url}
                                    alt={`Answer sheet page ${index + 1}`}
                                    className="w-full rounded-lg border-2 border-purple-500"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Extracted Text with ReactMarkdown */}
            {answer.extracted_text && (
                <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20 mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Extracted Text</h3>
                    <div className="bg-slate-900/50 p-6 rounded-lg overflow-auto">
                        <div className="prose prose-invert max-w-none prose-headings:text-blue-400 prose-h2:text-xl prose-h2:font-bold prose-h2:mb-4 prose-h2:mt-6 prose-h2:border-b prose-h2:border-blue-500/30 prose-h2:pb-2 prose-p:text-slate-200 prose-p:leading-relaxed prose-strong:text-white prose-strong:font-semibold prose-ul:text-slate-200 prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-2 prose-ol:text-slate-200 prose-ol:list-decimal prose-ol:pl-5 prose-ol:space-y-2 prose-li:text-slate-200 prose-li:leading-relaxed prose-li:marker:text-blue-400 prose-hr:border-purple-500/30 prose-hr:my-6 prose-code:text-cyan-400 prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {answer.extracted_text}
                            </ReactMarkdown>
                        </div>
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

            {/* Model Answer Section */}
            <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 backdrop-blur-lg border-emerald-500/30 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Lightbulb className="w-6 h-6 text-emerald-400" />
                        <h3 className="text-lg font-semibold text-white">Learn How to Answer</h3>
                    </div>
                    <Button
                        onClick={handleGenerateModelAnswer}
                        disabled={loadingModelAnswer}
                        className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700"
                    >
                        {loadingModelAnswer ? (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                {showModelAnswer ? 'Regenerate' : 'Show Model Answer'}
                            </>
                        )}
                    </Button>
                </div>

                {modelAnswerError && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                        <p className="text-red-400 text-sm">{modelAnswerError}</p>
                    </div>
                )}

                {!showModelAnswer && !loadingModelAnswer && (
                    <p className="text-slate-300 text-sm">
                        Click the button above to see an AI-generated model answer for this question.
                        This will help you understand how to structure and write a high-scoring answer.
                    </p>
                )}

                {showModelAnswer && modelAnswer && (
                    <div className="space-y-4">
                        {/* Introduction */}
                        <div className="bg-slate-900/50 p-5 rounded-lg border border-emerald-500/20">
                            <div className="flex items-center gap-2 mb-3">
                                <BookOpen className="w-4 h-4 text-emerald-400" />
                                <h4 className="font-semibold text-emerald-400">Introduction</h4>
                            </div>
                            <p className="text-slate-200 leading-relaxed">{modelAnswer.introduction}</p>
                        </div>

                        {/* Body Points */}
                        <div className="space-y-3">
                            {modelAnswer.body_points?.map((point: any, index: number) => (
                                <div
                                    key={index}
                                    className="bg-slate-900/50 p-5 rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-semibold text-cyan-400">{point.heading}</h4>
                                        {point.mark_worthy && (
                                            <Badge className={`
                                                ${point.mark_worthy === 'MUST-WRITE' ? 'bg-red-500/20 text-red-300 border-red-500/30' : ''}
                                                ${point.mark_worthy === 'HIGH-VALUE' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' : ''}
                                                ${point.mark_worthy === 'GOOD-TO-HAVE' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : ''}
                                                ${point.mark_worthy === 'DATA' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : ''}
                                                text-xs
                                            `}>
                                                {point.mark_worthy}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="prose prose-invert prose-sm max-w-none prose-headings:text-cyan-300 prose-h1:text-cyan-300 prose-h2:text-cyan-300 prose-h3:text-cyan-300 prose-h4:text-cyan-300 prose-h5:text-cyan-300 prose-h6:text-cyan-300 prose-p:text-slate-200 prose-p:leading-relaxed prose-ul:text-slate-200 prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-1 prose-ol:text-slate-200 prose-ol:list-decimal prose-ol:pl-5 prose-ol:space-y-1 prose-li:text-slate-200 prose-li:leading-relaxed prose-strong:text-white prose-em:text-slate-300">
                                        <ReactMarkdown>{point.content}</ReactMarkdown>
                                    </div>
                                    {point.explanation && (
                                        <div className="mt-3 pt-3 border-t border-slate-700">
                                            <p className="text-xs text-slate-400 italic">💡 {point.explanation}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Conclusion */}
                        <div className="bg-slate-900/50 p-5 rounded-lg border border-emerald-500/20">
                            <div className="flex items-center gap-2 mb-3">
                                <BookOpen className="w-4 h-4 text-emerald-400" />
                                <h4 className="font-semibold text-emerald-400">Conclusion</h4>
                            </div>
                            <p className="text-slate-200 leading-relaxed">{modelAnswer.conclusion}</p>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-4 text-sm">
                            <div className="bg-slate-900/50 px-4 py-2 rounded-lg">
                                <span className="text-slate-400">Word Count: </span>
                                <span className="text-white font-semibold">{modelAnswer.word_count}</span>
                            </div>
                            <div className="bg-slate-900/50 px-4 py-2 rounded-lg">
                                <span className="text-slate-400">Confidence: </span>
                                <span className="text-white font-semibold">{Math.round((modelAnswer.confidence_score || 0) * 100)}%</span>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

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

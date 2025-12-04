'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Database } from '@/lib/types/database.types'
import { formatDistanceToNow } from 'date-fns'

type Answer = Database['public']['Tables']['answers']['Row']
type Evaluation = Database['public']['Tables']['evaluations']['Row']

interface AnswerWithEvaluation extends Answer {
    evaluations: Evaluation[]
}

export default function HistoryPage() {
    const router = useRouter()
    const [answers, setAnswers] = useState<AnswerWithEvaluation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchHistory() {
            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()

                if (!user) throw new Error('Not authenticated')

                const { data, error: fetchError } = await supabase
                    .from('answers')
                    .select(`
            *,
            evaluations (*)
          `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })

                if (fetchError) throw fetchError

                setAnswers(data as AnswerWithEvaluation[])
            } catch (err: any) {
                setError(err.message || 'Failed to load history')
            } finally {
                setLoading(false)
            }
        }

        fetchHistory()
    }, [])

    const getScoreColor = (score: number) => {
        if (score >= 8) return 'bg-green-500'
        if (score >= 6) return 'bg-yellow-500'
        if (score >= 4) return 'bg-orange-500'
        return 'bg-red-500'
    }

    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text
        return text.substring(0, maxLength) + '...'
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        )
    }

    if (error) {
        return (
            <Card className="p-8 bg-red-500/10 border-red-500 text-center">
                <p className="text-red-400">{error}</p>
            </Card>
        )
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">Answer History</h1>
                <p className="text-slate-300">
                    View all your submitted answers and evaluations
                </p>
            </div>

            {answers.length === 0 ? (
                <Card className="p-12 bg-white/10 backdrop-blur-lg border-white/20 text-center">
                    <p className="text-slate-300 text-lg mb-4">No answers yet</p>
                    <p className="text-slate-400 mb-6">
                        Upload your first answer to get started with AI evaluation
                    </p>
                    <button
                        onClick={() => router.push('/upload')}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold"
                    >
                        Upload Answer
                    </button>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {answers.map((answer) => {
                        const latestEval = answer.evaluations[0]

                        return (
                            <Card
                                key={answer.id}
                                className="p-6 bg-white/10 backdrop-blur-lg border-white/20 hover:border-blue-500 transition-all cursor-pointer"
                                onClick={() => router.push(`/evaluation/${answer.id}`)}
                            >
                                <div className="flex gap-6">
                                    {/* Thumbnail */}
                                    <div className="flex-shrink-0">
                                        <img
                                            src={answer.image_url}
                                            alt="Answer thumbnail"
                                            className="w-32 h-32 object-cover rounded-lg border-2 border-blue-500"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-white mb-1">
                                                    {truncateText(answer.question_text, 100)}
                                                </h3>
                                                <div className="flex gap-2 mb-2">
                                                    <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                                                        {answer.question_source}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-slate-400 border-slate-400">
                                                        {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Score Badge */}
                                            {latestEval && (
                                                <div className="ml-4">
                                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                                                        <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center">
                                                            <span className="text-xl font-bold text-white">
                                                                {latestEval.score}
                                                                <span className="text-xs text-slate-400">/10</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Extracted text preview */}
                                        {answer.extracted_text && (
                                            <p className="text-slate-400 text-sm line-clamp-2">
                                                {answer.extracted_text}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

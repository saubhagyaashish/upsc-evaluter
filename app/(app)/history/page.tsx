'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Database } from '@/lib/types/database.types'
import { formatDistanceToNow } from 'date-fns'
import { useSwipeable } from 'react-swipeable'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

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
    const [swipedId, setSwipedId] = useState<string | null>(null)

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

    const handleDelete = async (answerId: string, questionText: string) => {
        // Store answer data for undo
        const answerToDelete = answers.find(a => a.id === answerId)

        // Optimistically remove from UI
        setAnswers(prev => prev.filter(a => a.id !== answerId))
        setSwipedId(null)

        // Show toast with undo option
        toast.success(`Answer deleted`, {
            description: questionText.substring(0, 50) + '...',
            duration: 5000,
            action: {
                label: 'Undo',
                onClick: () => {
                    // Restore the answer
                    if (answerToDelete) {
                        setAnswers(prev => [answerToDelete, ...prev].sort((a, b) =>
                            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                        ))
                        toast.success('Answer restored')
                    }
                }
            },
            onAutoClose: async () => {
                // Actually delete from database after toast dismisses
                try {
                    const supabase = createClient()
                    await supabase.from('answers').delete().eq('id', answerId)
                } catch (err) {
                    console.error('Failed to delete answer:', err)
                    // Restore on error
                    if (answerToDelete) {
                        setAnswers(prev => [answerToDelete, ...prev].sort((a, b) =>
                            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                        ))
                    }
                    toast.error('Failed to delete answer')
                }
            }
        })
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
        <div className="px-4">
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Answer History</h1>
                <p className="text-sm md:text-base text-slate-300">
                    View all your submitted answers and evaluations
                </p>
            </div>

            {answers.length === 0 ? (
                <Card className="p-6 md:p-12 bg-white/10 backdrop-blur-lg border-white/20 text-center">
                    <p className="text-slate-300 text-base md:text-lg mb-4">No answers yet</p>
                    <p className="text-sm md:text-base text-slate-400 mb-6">
                        Upload your first answer to get started with AI evaluation
                    </p>
                    <button
                        onClick={() => router.push('/upload')}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 md:py-4 rounded-lg font-semibold text-sm md:text-base"
                    >
                        Upload Answer
                    </button>
                </Card>
            ) : (
                <div className="grid gap-4 md:gap-6">
                    {answers.map((answer) => {
                        const latestEval = answer.evaluations[0]

                        return (
                            <SwipeableCard
                                key={answer.id}
                                answer={answer}
                                latestEval={latestEval}
                                onDelete={() => handleDelete(answer.id, answer.question_text)}
                                onClick={() => router.push(`/evaluation/${answer.id}`)}
                                isActive={swipedId === answer.id}
                                setActive={() => setSwipedId(answer.id)}
                                resetActive={() => setSwipedId(null)}
                                truncateText={truncateText}
                            />
                        )
                    })}
                </div>
            )}
        </div>
    )
}

// Separate component for swipeable card
interface SwipeableCardProps {
    answer: AnswerWithEvaluation
    latestEval: Evaluation | undefined
    onDelete: () => void
    onClick: () => void
    isActive: boolean
    setActive: () => void
    resetActive: () => void
    truncateText: (text: string, maxLength: number) => string
}

function SwipeableCard({ answer, latestEval, onDelete, onClick, isActive, setActive, resetActive, truncateText }: SwipeableCardProps) {
    const [swipeOffset, setSwipeOffset] = useState(0)

    const handlers = useSwipeable({
        onSwiping: (eventData) => {
            // Only allow left swipe on mobile
            if (eventData.dir === 'Left' && window.innerWidth < 768) {
                setSwipeOffset(Math.max(-100, eventData.deltaX))
                setActive()
            }
        },
        onSwipedLeft: (eventData) => {
            if (window.innerWidth < 768 && Math.abs(eventData.deltaX) > 100) {
                // Trigger delete if swiped far enough
                onDelete()
            }
            setSwipeOffset(0)
            resetActive()
        },
        onSwipedRight: () => {
            setSwipeOffset(0)
            resetActive()
        },
        trackMouse: false,
        trackTouch: true,
    })

    return (
        <div className="relative overflow-hidden rounded-lg">
            {/* Delete background - shows when swiping */}
            <div className="absolute inset-0 bg-red-500 flex items-center justify-end px-6 rounded-lg">
                <Trash2 className="w-6 h-6 text-white" />
            </div>

            {/* Card content */}
            <div
                {...handlers}
                style={{
                    transform: `translateX(${swipeOffset}px)`,
                    transition: swipeOffset === 0 ? 'transform 0.3s ease-out' : 'none',
                }}
            >
                <Card
                    className="p-4 md:p-6 bg-white/10 backdrop-blur-lg border-white/20 hover:border-blue-500 transition-all cursor-pointer active:scale-[0.98]"
                    onClick={(e) => {
                        if (swipeOffset === 0) onClick()
                    }}
                >
                    <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0 w-full sm:w-auto">
                            <img
                                src={answer.image_url}
                                alt="Answer thumbnail"
                                className="w-full sm:w-24 md:w-32 h-48 sm:h-24 md:h-32 object-cover rounded-lg border-2 border-blue-500"
                            />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 sm:gap-0 mb-2">
                                <div className="flex-1 w-full">
                                    <h3 className="text-base md:text-lg font-semibold text-white mb-2">
                                        {truncateText(answer.question_text, 100)}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className="text-cyan-400 border-cyan-400 text-xs">
                                            {answer.question_source}
                                        </Badge>
                                        <Badge variant="outline" className="text-slate-400 border-slate-400 text-xs">
                                            {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Score Badge */}
                                {latestEval && (
                                    <div className="sm:ml-4">
                                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-900 flex items-center justify-center">
                                                <span className="text-lg md:text-xl font-bold text-white">
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
                                <p className="text-slate-400 text-xs md:text-sm line-clamp-2">
                                    {answer.extracted_text}
                                </p>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}

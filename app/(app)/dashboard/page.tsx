'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Database } from '@/lib/types/database.types'
import { TrendingUp, Upload, FileText, Award } from 'lucide-react'

type Answer = Database['public']['Tables']['answers']['Row']
type Evaluation = Database['public']['Tables']['evaluations']['Row']

interface AnswerWithEvaluation extends Answer {
    evaluations: Evaluation[]
}

interface DashboardStats {
    totalAnswers: number
    averageScore: number
    lastScore: number
    recentAnswers: AnswerWithEvaluation[]
}

export default function DashboardPage() {
    const router = useRouter()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [userName, setUserName] = useState('')

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()

                if (!user) throw new Error('Not authenticated')

                // Get user profile
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    setUserName(profile.full_name || 'Student')
                }

                // Get answers with evaluations
                const { data: answers, error: answersError } = await supabase
                    .from('answers')
                    .select(`
            *,
            evaluations (*)
          `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })

                if (answersError) throw answersError

                const answersWithEval = answers as AnswerWithEvaluation[]

                // Calculate stats
                const totalAnswers = answersWithEval.length
                const answersWithScores = answersWithEval.filter(a => a.evaluations.length > 0)

                let averageScore = 0
                let lastScore = 0

                if (answersWithScores.length > 0) {
                    const scores = answersWithScores.map(a => a.evaluations[0].score)
                    averageScore = scores.reduce((a, b) => a + b, 0) / scores.length
                    lastScore = scores[0]
                }

                setStats({
                    totalAnswers,
                    averageScore: Math.round(averageScore * 10) / 10,
                    lastScore,
                    recentAnswers: answersWithEval.slice(0, 3),
                })
            } catch (err: any) {
                console.error('Failed to load dashboard:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-16 w-96" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
                <Skeleton className="h-64" />
            </div>
        )
    }

    return (
        <div>
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">
                    Welcome back, {userName}! 👋
                </h1>
                <p className="text-slate-300">
                    Track your progress and improve your UPSC answer writing skills
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-800 border-none">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-200 text-sm mb-1">Total Answers</p>
                            <p className="text-4xl font-bold text-white">{stats?.totalAnswers || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-cyan-600 to-cyan-800 border-none">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-cyan-200 text-sm mb-1">Average Score</p>
                            <p className="text-4xl font-bold text-white">{stats?.averageScore || 0}/10</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Award className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 border-none">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-indigo-200 text-sm mb-1">Last Score</p>
                            <p className="text-4xl font-bold text-white">{stats?.lastScore || 0}/10</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Quick Action */}
            <Card className="p-8 bg-gradient-to-r from-blue-600 to-cyan-600 border-none mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Ready to practice?</h3>
                        <p className="text-purple-100">
                            Upload a new answer and get instant AI-powered feedback
                        </p>
                    </div>
                    <Button
                        onClick={() => router.push('/upload')}
                        className="bg-white text-blue-600 hover:bg-purple-50 font-semibold px-8 py-6 text-lg"
                    >
                        <Upload className="w-5 h-5 mr-2" />
                        Upload Answer
                    </Button>
                </div>
            </Card>

            {/* Recent Answers */}
            {stats && stats.recentAnswers.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Recent Answers</h2>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/history')}
                            className="border-blue-600 text-cyan-400 hover:bg-blue-600/10"
                        >
                            View All
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {stats.recentAnswers.map((answer) => {
                            const evaluation = answer.evaluations[0]

                            return (
                                <Card
                                    key={answer.id}
                                    className="p-4 bg-white/10 backdrop-blur-lg border-white/20 hover:border-blue-500 transition-all cursor-pointer"
                                    onClick={() => router.push(`/evaluation/${answer.id}`)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium truncate mb-1">
                                                {answer.question_text}
                                            </p>
                                            <p className="text-slate-400 text-sm">
                                                {new Date(answer.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                        {evaluation && (
                                            <div className="ml-4">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                                                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center">
                                                        <span className="text-lg font-bold text-white">
                                                            {evaluation.score}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {stats && stats.totalAnswers === 0 && (
                <Card className="p-12 bg-white/10 backdrop-blur-lg border-white/20 text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">Get Started!</h3>
                    <p className="text-slate-300 mb-6">
                        Upload your first answer to receive AI-powered evaluation and improve your UPSC preparation
                    </p>
                    <Button
                        onClick={() => router.push('/upload')}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-8 py-6 text-lg"
                    >
                        <Upload className="w-5 h-5 mr-2" />
                        Upload Your First Answer
                    </Button>
                </Card>
            )}
        </div>
    )
}

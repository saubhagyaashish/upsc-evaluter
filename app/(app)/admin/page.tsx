'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Database } from '@/lib/types/database.types'
import { Users, FileText, Activity, DollarSign } from 'lucide-react'

type Answer = Database['public']['Tables']['answers']['Row']
type Evaluation = Database['public']['Tables']['evaluations']['Row']
type UserProfile = Database['public']['Tables']['user_profiles']['Row']

interface AnswerWithDetails extends Answer {
    evaluations: Evaluation[]
    user_profiles: UserProfile
}

interface AdminStats {
    totalUsers: number
    totalAnswers: number
    totalEvaluations: number
    averageScore: number
}

export default function AdminPage() {
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [recentAnswers, setRecentAnswers] = useState<AnswerWithDetails[]>([])
    const [loading, setLoading] = useState(true)
    const [questionStats, setQuestionStats] = useState<Map<string, number>>(new Map())

    useEffect(() => {
        async function fetchAdminData() {
            try {
                const supabase = createClient()

                // Fetch all users
                const { data: users } = await supabase
                    .from('user_profiles')
                    .select('*')

                // Fetch all answers with evaluations and user profiles
                const { data: answers } = await supabase
                    .from('answers')
                    .select(`
            *,
            evaluations (*),
            user_profiles (*)
          `)
                    .order('created_at', { ascending: false })
                    .limit(10)

                // Fetch evaluations for stats
                const { data: evaluations } = await supabase
                    .from('evaluations')
                    .select('score')

                // Calculate stats
                const totalUsers = users?.length || 0
                const totalAnswers = answers?.length || 0
                const totalEvaluations = evaluations?.length || 0

                let averageScore = 0
                if (evaluations && evaluations.length > 0) {
                    const scores = evaluations.map(e => e.score)
                    averageScore = scores.reduce((a, b) => a + b, 0) / scores.length
                }

                setStats({
                    totalUsers,
                    totalAnswers,
                    totalEvaluations,
                    averageScore: Math.round(averageScore * 10) / 10,
                })

                setRecentAnswers(answers as AnswerWithDetails[] || [])

                // Calculate question stats
                const questionCounts = new Map<string, number>()
                answers?.forEach(answer => {
                    const question = answer.question_text.substring(0, 100) // Truncate for grouping
                    questionCounts.set(question, (questionCounts.get(question) || 0) + 1)
                })
                setQuestionStats(questionCounts)

            } catch (err: any) {
                console.error('Failed to load admin data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchAdminData()
    }, [])

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-16 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
                <p className="text-slate-300">
                    Monitor usage, track questions, and analyze user activity
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-800 border-none">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-200 text-sm mb-1">Total Users</p>
                            <p className="text-4xl font-bold text-white">{stats?.totalUsers || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </Card>

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

                <Card className="p-6 bg-gradient-to-br from-green-600 to-green-800 border-none">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-200 text-sm mb-1">Avg Score</p>
                            <p className="text-4xl font-bold text-white">{stats?.averageScore || 0}/10</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-cyan-600 to-cyan-800 border-none">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-cyan-200 text-sm mb-1">Evaluations</p>
                            <p className="text-4xl font-bold text-white">{stats?.totalEvaluations || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Most Asked Questions */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Popular Questions</h2>
                <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
                    <div className="space-y-3">
                        {Array.from(questionStats.entries())
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 5)
                            .map(([question, count], index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <p className="text-slate-300 text-sm flex-1">{question}...</p>
                                    <Badge className="bg-blue-600 ml-4">{count} attempts</Badge>
                                </div>
                            ))}
                        {questionStats.size === 0 && (
                            <p className="text-slate-400 text-center py-4">No questions yet</p>
                        )}
                    </div>
                </Card>
            </div>

            {/* Recent Activity */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
                <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
                    <div className="space-y-4">
                        {recentAnswers.map((answer) => {
                            const evaluation = answer.evaluations[0]

                            return (
                                <div key={answer.id} className="flex items-center justify-between border-b border-slate-700 pb-4 last:border-0 last:pb-0">
                                    <div className="flex-1">
                                        <p className="text-white font-medium mb-1">
                                            {answer.user_profiles.full_name || 'Unknown User'}
                                        </p>
                                        <p className="text-slate-400 text-sm truncate max-w-md">
                                            {answer.question_text}
                                        </p>
                                        <div className="flex gap-2 mt-1">
                                            <Badge variant="outline" className="text-cyan-400 border-cyan-400 text-xs">
                                                {answer.question_source}
                                            </Badge>
                                            <Badge variant="outline" className="text-slate-400 border-slate-400 text-xs">
                                                {new Date(answer.created_at).toLocaleDateString('en-IN')}
                                            </Badge>
                                        </div>
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
                            )
                        })}
                        {recentAnswers.length === 0 && (
                            <p className="text-slate-400 text-center py-4">No activity yet</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}

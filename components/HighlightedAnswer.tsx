'use client'

import { Card } from '@/components/ui/card'
import MarkWorthyBadge from './MarkWorthyBadge'

interface BodyPoint {
    heading: string
    content: string
    mark_worthy: 'MUST-WRITE' | 'HIGH-VALUE' | 'GOOD-TO-HAVE' | 'DATA'
    explanation: string
}

interface HighlightedAnswerProps {
    introduction: string
    bodyPoints: BodyPoint[]
    conclusion: string
    wordCount: number
    confidence: number
}

export default function HighlightedAnswer({
    introduction,
    bodyPoints,
    conclusion,
    wordCount,
    confidence,
}: HighlightedAnswerProps) {
    const getConfidenceStars = (score: number) => {
        const stars = Math.round(score * 5)
        return '⭐'.repeat(stars) + '☆'.repeat(5 - stars)
    }

    const getConfidenceLabel = (score: number) => {
        if (score >= 0.9) return 'Excellent'
        if (score >= 0.7) return 'Good'
        if (score >= 0.5) return 'Fair'
        return 'Needs Review'
    }

    return (
        <div className="space-y-6">
            {/* Quality Metrics */}
            <Card className="p-4 bg-slate-700/50 border-slate-600">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-slate-300">Word Count</div>
                        <div className="text-2xl font-bold text-white">
                            {wordCount} <span className="text-sm text-slate-400">words</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-slate-300">Confidence</div>
                        <div className="text-lg font-bold text-white">
                            {getConfidenceStars(confidence)}
                            <span className="ml-2 text-sm text-slate-400">{getConfidenceLabel(confidence)}</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Introduction */}
            <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/20">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">📝 Introduction</h3>
                    <MarkWorthyBadge
                        type="MUST-WRITE"
                        explanation="Clear introduction sets context and shows you understood the question"
                        marksValue={1}
                    />
                </div>
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{introduction}</p>
            </Card>

            {/* Body Points */}
            <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">📊 Main Body</h3>
                <div className="space-y-6">
                    {bodyPoints.map((point, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="text-md font-semibold text-cyan-300">{point.heading}</h4>
                                <MarkWorthyBadge
                                    type={point.mark_worthy}
                                    explanation={point.explanation}
                                    marksValue={index === 0 ? 2 : 1.5}
                                />
                            </div>
                            <div className="text-slate-200 leading-relaxed whitespace-pre-wrap">{point.content}</div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Conclusion */}
            <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/20">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">✅ Conclusion</h3>
                    <MarkWorthyBadge
                        type="MUST-WRITE"
                        explanation="Way forward and optimistic outlook are mandatory for good scores"
                        marksValue={1.5}
                    />
                </div>
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{conclusion}</p>
            </Card>

            {/* Marking Legend */}
            <Card className="p-4 bg-slate-700/30 border-slate-600">
                <h4 className="text-sm font-semibold text-white mb-3">💡 Marking Guide</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="text-red-400">🎯</span>
                        <span className="text-slate-300">MUST-WRITE: Essential for marks</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-slate-300">HIGH-VALUE: Bonus points</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-blue-400">💡</span>
                        <span className="text-slate-300">GOOD-TO-HAVE: Quality boost</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-green-400">📊</span>
                        <span className="text-slate-300">DATA/STATS: Strengthens argument</span>
                    </div>
                </div>
            </Card>
        </div>
    )
}

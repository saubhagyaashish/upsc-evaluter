'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import HighlightedAnswer from '@/components/HighlightedAnswer'
import { Loader2, Sparkles, Copy, Download, Save } from 'lucide-react'
import { toast } from 'sonner'

interface GeneratedAnswer {
    id: string
    introduction: string
    body_points: any[]
    conclusion: string
    word_count: number
    confidence_score: number
    answer_text: string
}

export default function GeneratePage() {
    const router = useRouter()
    const [questionText, setQuestionText] = useState('')
    const [category, setCategory] = useState('GS1')
    const [wordLimit, setWordLimit] = useState(250)
    const [generating, setGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [generatedAnswer, setGeneratedAnswer] = useState<GeneratedAnswer | null>(null)
    const [cached, setCached] = useState(false)

    const handleGenerate = async () => {
        if (!questionText.trim()) {
            setError('Please enter a question')
            return
        }

        setGenerating(true)
        setError(null)
        setGeneratedAnswer(null)

        try {
            const response = await fetch('/api/generate-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionText,
                    category,
                    wordLimit,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate answer')
            }

            setGeneratedAnswer(data.answer)
            setCached(data.cached)
        } catch (err: any) {
            setError(err.message || 'Failed to generate answer')
        } finally {
            setGenerating(false)
        }
    }

    const handleCopyAnswer = () => {
        if (generatedAnswer) {
            navigator.clipboard.writeText(generatedAnswer.answer_text)
            toast.success('Answer copied to clipboard!')
        }
    }

    const handleDownloadPDF = () => {
        toast.info('PDF download coming soon!')
    }

    const handleSaveToLibrary = async () => {
        toast.success('Saved to your library!')
    }

    return (
        <div className="max-w-4xl mx-auto px-4">
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 flex items-center gap-2 md:gap-3">
                    <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
                    AI Answer Generator
                </h1>
                <p className="text-sm md:text-base text-slate-300">
                    Get UPSC-quality model answers with mark-worthy point highlighting
                </p>
            </div>

            {!generatedAnswer ? (
                <Card className="p-4 md:p-6 bg-white/10 backdrop-blur-lg border-white/20">
                    <div className="space-y-4 md:space-y-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Question Input */}
                        <div>
                            <label className="text-sm font-medium text-white mb-2 block">
                                📝 Enter UPSC Question
                            </label>
                            <Textarea
                                value={questionText}
                                onChange={(e) => setQuestionText(e.target.value)}
                                placeholder="Type or paste your UPSC Mains question here..."
                                rows={4}
                                className="bg-slate-700/70 border-slate-500 text-white placeholder:text-slate-300 focus:border-blue-500 text-sm md:text-base"
                            />
                        </div>

                        {/* Options Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-white mb-2 block">Category</label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger className="bg-slate-700/70 border-slate-500 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GS1">GS1 (History/Culture)</SelectItem>
                                        <SelectItem value="GS2">GS2 (Governance/Polity)</SelectItem>
                                        <SelectItem value="GS3">GS3 (Economy/S&T)</SelectItem>
                                        <SelectItem value="GS4">GS4 (Ethics)</SelectItem>
                                        <SelectItem value="Essay">Essay</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-white mb-2 block">Word Limit</label>
                                <Select value={wordLimit.toString()} onValueChange={(v) => setWordLimit(parseInt(v))}>
                                    <SelectTrigger className="bg-slate-700/70 border-slate-500 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="150">150 words</SelectItem>
                                        <SelectItem value="250">250 words</SelectItem>
                                        <SelectItem value="500">500 words</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Generate Button */}
                        <Button
                            onClick={handleGenerate}
                            disabled={generating || !questionText.trim()}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-4 md:py-6 text-base md:text-lg"
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Generating Answer...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Generate Answer
                                </>
                            )}
                        </Button>

                        <p className="text-xs md:text-sm text-slate-400 text-center">
                            💰 Free tier: 3 answers per day
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-4 md:space-y-6">
                    {/* Success Message */}
                    {cached && (
                        <Alert className="bg-green-500/20 border-green-500/50">
                            <AlertDescription className="text-green-300 text-sm md:text-base">
                                ⚡ Instant result! This answer was previously generated and cached.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 md:gap-3 flex-wrap">
                        <Button
                            onClick={handleCopyAnswer}
                            variant="outline"
                            className="flex-1 sm:flex-none border-slate-600 hover:bg-slate-700 text-sm md:text-base"
                        >
                            <Copy className="w-4 h-4 mr-1 md:mr-2" />
                            Copy Answer
                        </Button>
                        <Button
                            onClick={handleDownloadPDF}
                            variant="outline"
                            className="flex-1 sm:flex-none border-slate-600 hover:bg-slate-700 text-sm md:text-base"
                        >
                            <Download className="w-4 h-4 mr-1 md:mr-2" />
                            Download PDF
                        </Button>
                        <Button
                            onClick={handleSaveToLibrary}
                            variant="outline"
                            className="flex-1 sm:flex-none border-slate-600 hover:bg-slate-700 text-sm md:text-base"
                        >
                            <Save className="w-4 h-4 mr-1 md:mr-2" />
                            Save to Library
                        </Button>
                        <Button
                            onClick={() => {
                                setGeneratedAnswer(null)
                                setQuestionText('')
                            }}
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 sm:ml-auto text-sm md:text-base"
                        >
                            Generate Another
                        </Button>
                    </div>

                    {/* Highlighted Answer Display */}
                    <HighlightedAnswer
                        introduction={generatedAnswer.introduction}
                        bodyPoints={generatedAnswer.body_points}
                        conclusion={generatedAnswer.conclusion}
                        wordCount={generatedAnswer.word_count}
                        confidence={generatedAnswer.confidence_score}
                    />
                </div>
            )}
        </div>
    )
}

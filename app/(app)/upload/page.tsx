'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/ImageUpload'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { generateUniqueFileName } from '@/lib/utils/imageValidation'
import { Loader2 } from 'lucide-react'

type QuestionSource = 'manual' | 'bank' | 'ocr'

export default function UploadPage() {
    const router = useRouter()
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [questionSource, setQuestionSource] = useState<QuestionSource>('manual')

    // Manual entry
    const [manualQuestion, setManualQuestion] = useState('')

    // Question bank
    const [selectedQuestionId, setSelectedQuestionId] = useState('')

    // OCR
    const [ocrQuestion, setOcrQuestion] = useState('')
    const [extractingQuestion, setExtractingQuestion] = useState(false)

    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)

    const handleImageSelect = (file: File) => {
        setSelectedFile(file)
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleClearPreview = () => {
        setSelectedFile(null)
        setPreview(null)
    }

    const handleExtractQuestion = async () => {
        if (!selectedFile) return

        setExtractingQuestion(true)
        setError(null)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) throw new Error('Not authenticated')

            // Upload image temporarily for OCR
            const fileName = generateUniqueFileName(user.id, selectedFile.name)
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('answer-images')
                .upload(fileName, selectedFile)

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('answer-images')
                .getPublicUrl(fileName)

            // Extract question via API
            const response = await fetch('/api/extract-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl: publicUrl }),
            })

            if (!response.ok) throw new Error('Failed to extract question')

            const { question } = await response.json()
            setOcrQuestion(question)
        } catch (err: any) {
            setError(err.message || 'Failed to extract question')
        } finally {
            setExtractingQuestion(false)
        }
    }

    const handleSubmit = async () => {
        if (!selectedFile) {
            setError('Please select an image')
            return
        }

        let questionText = ''
        let questionId = null

        // Get question based on source
        if (questionSource === 'manual') {
            if (!manualQuestion.trim()) {
                setError('Please enter the question')
                return
            }
            questionText = manualQuestion
        } else if (questionSource === 'bank') {
            if (!selectedQuestionId) {
                setError('Please select a question from the bank')
                return
            }
            questionId = selectedQuestionId
            // We'll fetch the question text from the database
        } else if (questionSource === 'ocr') {
            if (!ocrQuestion.trim()) {
                setError('Please extract the question first')
                return
            }
            questionText = ocrQuestion
        }

        setUploading(true)
        setProgress(10)
        setError(null)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) throw new Error('Not authenticated')

            setProgress(30)

            // Upload image to Supabase Storage
            const fileName = generateUniqueFileName(user.id, selectedFile.name)
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('answer-images')
                .upload(fileName, selectedFile)

            if (uploadError) throw uploadError

            setProgress(50)

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('answer-images')
                .getPublicUrl(fileName)

            setProgress(60)

            // If question bank, fetch question text
            if (questionSource === 'bank' && questionId) {
                const { data: questionData, error: questionError } = await supabase
                    .from('questions')
                    .select('question_text')
                    .eq('id', questionId)
                    .single()

                if (questionError) throw questionError
                questionText = questionData.question_text
            }

            // Save answer to database
            const { data: answerData, error: answerError } = await supabase
                .from('answers')
                .insert({
                    user_id: user.id,
                    question_id: questionId,
                    question_text: questionText,
                    question_source: questionSource,
                    image_url: publicUrl,
                })
                .select()
                .single()

            if (answerError) throw answerError

            setProgress(80)

            // Trigger evaluation
            const evalResponse = await fetch('/api/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answerId: answerData.id }),
            })

            if (!evalResponse.ok) throw new Error('Evaluation failed')

            setProgress(100)

            // Redirect to evaluation result
            router.push(`/evaluation/${answerData.id}`)
        } catch (err: any) {
            setError(err.message || 'Failed to upload answer')
            setProgress(0)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">Upload Answer</h1>
                <p className="text-slate-300">
                    Upload your handwritten answer and get instant AI evaluation
                </p>
            </div>

            <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
                <div className="space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Question Input Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Step 1: Provide Question</h3>

                        <Tabs value={questionSource} onValueChange={(v) => setQuestionSource(v as QuestionSource)}>
                            <TabsList className="grid w-full grid-cols-3 bg-slate-700/50 p-1">
                                <TabsTrigger
                                    value="manual"
                                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-slate-200 data-[state=inactive]:hover:bg-slate-600/50"
                                >
                                    Manual Entry
                                </TabsTrigger>
                                <TabsTrigger
                                    value="bank"
                                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-slate-200 data-[state=inactive]:hover:bg-slate-600/50"
                                >
                                    Question Bank
                                </TabsTrigger>
                                <TabsTrigger
                                    value="ocr"
                                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-slate-200 data-[state=inactive]:hover:bg-slate-600/50"
                                >
                                    Auto Extract
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="manual" className="space-y-2 mt-4">
                                <label className="text-sm font-medium text-white">Enter the question you answered</label>
                                <Textarea
                                    value={manualQuestion}
                                    onChange={(e) => setManualQuestion(e.target.value)}
                                    placeholder="Type or paste the UPSC question here..."
                                    rows={4}
                                    className="bg-slate-700/70 border-slate-500 text-white placeholder:text-slate-300 focus:border-blue-500"
                                />
                            </TabsContent>

                            <TabsContent value="bank" className="space-y-2 mt-4">
                                <label className="text-sm font-medium text-white">Select a question from the bank</label>
                                <Input
                                    type="text"
                                    placeholder="Search questions... (Coming soon)"
                                    disabled
                                    className="bg-slate-700/70 border-slate-500 text-white placeholder:text-slate-300"
                                />
                                <p className="text-xs text-slate-400">
                                    Question bank will be populated with UPSC previous year questions
                                </p>
                            </TabsContent>

                            <TabsContent value="ocr" className="space-y-2 mt-4">
                                <label className="text-sm font-medium text-white">Extract question from answer sheet</label>
                                <div className="flex gap-2">
                                    <Input
                                        value={ocrQuestion}
                                        onChange={(e) => setOcrQuestion(e.target.value)}
                                        placeholder="Click 'Extract Question' to auto-detect from image"
                                        readOnly
                                        className="bg-slate-700/70 border-slate-500 text-white placeholder:text-slate-300"
                                    />
                                    <Button
                                        onClick={handleExtractQuestion}
                                        disabled={!selectedFile || extractingQuestion}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {extractingQuestion ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Extracting...
                                            </>
                                        ) : (
                                            'Extract Question'
                                        )}
                                    </Button>
                                </div>
                                <p className="text-xs text-slate-400">
                                    Upload an image first, then click to extract the question
                                </p>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Image Upload Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Step 2: Upload Answer Image</h3>
                        <ImageUpload
                            onImageSelect={handleImageSelect}
                            preview={preview}
                            onClearPreview={handleClearPreview}
                        />
                    </div>

                    {/* Progress Bar */}
                    {uploading && (
                        <div className="space-y-2">
                            <Progress value={progress} className="w-full" />
                            <p className="text-sm text-slate-300 text-center">
                                {progress < 50 ? 'Uploading image...' : progress < 80 ? 'Processing...' : 'Evaluating answer...'}
                            </p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={uploading || !selectedFile}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-6 text-lg"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Upload & Evaluate'
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    )
}

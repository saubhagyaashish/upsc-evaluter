'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageCard from '@/components/PageCard'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { generateUniqueFileName } from '@/lib/utils/imageValidation'
import { Loader2, Upload, FileImage } from 'lucide-react'

type QuestionSource = 'manual' | 'bank' | 'ocr'

interface PageFile {
    id: string
    file: File
    preview: string
    order: number
}

export default function UploadPage() {
    const router = useRouter()

    // Multi-page state
    const [pages, setPages] = useState<PageFile[]>([])
    const maxPages = 5

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

    // Drag state for reordering
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

    const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])

        if (pages.length + files.length > maxPages) {
            setError(`Maximum ${maxPages} pages allowed`)
            return
        }

        // Validate each file
        const validFiles: PageFile[] = []
        for (const file of files) {
            // Check file type
            if (!file.type.startsWith('image/')) {
                setError(`${file.name} is not an image`)
                continue
            }

            // Check file size (5MB per file)
            if (file.size > 5 * 1024 * 1024) {
                setError(`${file.name} is larger than 5MB`)
                continue
            }

            // Create preview
            const reader = new FileReader()
            const id = `${Date.now()}-${Math.random()}`

            reader.onloadend = () => {
                const newPage: PageFile = {
                    id,
                    file,
                    preview: reader.result as string,
                    order: pages.length + validFiles.length
                }

                setPages(prev => [...prev, newPage])
            }
            reader.readAsDataURL(file)

            validFiles.push({} as PageFile) // Placeholder
        }

        setError(null)
    }

    const handleRemovePage = (id: string) => {
        setPages(prev => prev.filter(p => p.id !== id))
    }

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault()

        if (draggedIndex === null || draggedIndex === dropIndex) return

        const newPages = [...pages]
        const [draggedPage] = newPages.splice(draggedIndex, 1)
        newPages.splice(dropIndex, 0, draggedPage)

        setPages(newPages)
        setDraggedIndex(null)
    }

    const handleExtractQuestion = async () => {
        if (pages.length === 0) {
            setError('Please upload at least one page')
            return
        }

        setExtractingQuestion(true)
        setError(null)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) throw new Error('Not authenticated')

            // Upload first page temporarily for OCR
            const firstPage = pages[0]
            const fileName = generateUniqueFileName(user.id, firstPage.file.name)
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('answer-images')
                .upload(fileName, firstPage.file)

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
        if (pages.length === 0) {
            setError('Please upload at least one page')
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

            // Upload all pages to Supabase Storage
            const imageUrls: string[] = []
            const uploadPromises = pages.map(async (page, index) => {
                const fileName = generateUniqueFileName(user.id, `page${index + 1}_${page.file.name}`)
                const { error: uploadError } = await supabase.storage
                    .from('answer-images')
                    .upload(fileName, page.file)

                if (uploadError) throw uploadError

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('answer-images')
                    .getPublicUrl(fileName)

                return publicUrl
            })

            const urls = await Promise.all(uploadPromises)
            imageUrls.push(...urls)

            setProgress(50)

            // Get question text if using question bank
            if (questionSource === 'bank' && questionId) {
                const { data: questionData } = await supabase
                    .from('questions')
                    .select('question_text')
                    .eq('id', questionId)
                    .single()

                if (questionData) {
                    questionText = questionData.question_text
                }
            }

            setProgress(70)

            // Store as JSON array (for multi-page) or single URL (for backward compatibility)
            const imageUrlField = imageUrls.length === 1 ? imageUrls[0] : JSON.stringify(imageUrls)

            // Save answer to database
            const { data: answerData, error: answerError } = await supabase
                .from('answers')
                .insert({
                    user_id: user.id,
                    question_id: questionId,
                    question_text: questionText,
                    question_source: questionId ? 'Question Bank' : 'Manual Entry',
                    image_url: imageUrlField,
                })
                .select()
                .single()

            if (answerError) throw answerError

            setProgress(90)

            // Trigger evaluation
            const evalResponse = await fetch('/api/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answerId: answerData.id }),
            })

            if (!evalResponse.ok) throw new Error('Failed to evaluate answer')

            setProgress(100)

            // Redirect to evaluation page
            router.push(`/evaluation/${answerData.id}`)
        } catch (err: any) {
            console.error('Upload error:', err)
            setError(err.message || 'Failed to upload answer')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="px-4 max-w-6xl mx-auto">
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Upload Answer</h1>
                <p className="text-sm md:text-base text-slate-300">
                    Upload your answer sheet(s) for AI-powered evaluation
                </p>
            </div>

            {error && (
                <Alert className="mb-6 bg-red-500/10 border-red-500">
                    <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-6">
                {/* Multi-Page Upload Section */}
                <Card className="p-4 md:p-6 bg-white/10 backdrop-blur-lg border-white/20">
                    <h2 className="text-lg md:text-xl font-semibold text-white mb-4">
                        Answer Sheets {pages.length > 0 && `(${pages.length}/${maxPages})`}
                    </h2>

                    {/* Upload Area */}
                    {pages.length < maxPages && (
                        <label className="block mb-6">
                            <div className="border-2 border-dashed border-blue-500/50 hover:border-blue-500 rounded-lg p-8 text-center cursor-pointer transition-all bg-slate-900/50 hover:bg-slate-900/70">
                                <Upload className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                                <p className="text-white font-semibold mb-2">
                                    {pages.length === 0 ? 'Upload Answer Sheets' : 'Add More Pages'}
                                </p>
                                <p className="text-sm text-slate-400 mb-4">
                                    Drag & drop or click to browse (Max {maxPages} pages, 5MB each)
                                </p>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFilesSelect}
                                    className="hidden"
                                    disabled={uploading}
                                />
                            </div>
                        </label>
                    )}

                    {/* Pages Grid */}
                    {pages.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {pages.map((page, index) => (
                                <PageCard
                                    key={page.id}
                                    page={page}
                                    index={index}
                                    totalPages={pages.length}
                                    onRemove={handleRemovePage}
                                    onDragStart={handleDragStart}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                />
                            ))}
                        </div>
                    )}
                </Card>

                {/* Question Input Section */}
                <Card className="p-4 md:p-6 bg-white/10 backdrop-blur-lg border-white/20">
                    <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Question</h2>

                    <Tabs value={questionSource} onValueChange={(v) => setQuestionSource(v as QuestionSource)}>
                        <TabsList className="grid grid-cols-3 h-auto mb-4">
                            <TabsTrigger value="manual" className="text-xs md:text-sm">Manual Entry</TabsTrigger>
                            <TabsTrigger value="bank" className="text-xs md:text-sm">Question Bank</TabsTrigger>
                            <TabsTrigger value="ocr" className="text-xs md:text-sm">Extract from Image</TabsTrigger>
                        </TabsList>

                        <TabsContent value="manual">
                            <Textarea
                                placeholder="Enter the question text..."
                                value={manualQuestion}
                                onChange={(e) => setManualQuestion(e.target.value)}
                                rows={4}
                                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 text-sm md:text-base"
                            />
                        </TabsContent>

                        <TabsContent value="bank">
                            <Input
                                placeholder="Select from question bank (coming soon)"
                                disabled
                                className="bg-slate-900/50 border-slate-700 text-white"
                            />
                        </TabsContent>

                        <TabsContent value="ocr">
                            <div className="space-y-4">
                                <Button
                                    onClick={handleExtractQuestion}
                                    disabled={pages.length === 0 || extractingQuestion}
                                    className="w-full md:w-auto bg-purple-600 hover:bg-purple-700"
                                >
                                    {extractingQuestion ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Extracting...
                                        </>
                                    ) : (
                                        <>
                                            <FileImage className="w-4 h-4 mr-2" />
                                            Extract Question from First Page
                                        </>
                                    )}
                                </Button>
                                <Textarea
                                    placeholder="Extracted question will appear here..."
                                    value={ocrQuestion}
                                    onChange={(e) => setOcrQuestion(e.target.value)}
                                    rows={4}
                                    className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 text-sm md:text-base"
                                />
                            </div>
                        </TabsContent>
                    </Tabs>
                </Card>

                {/* Submit Section */}
                {uploading && (
                    <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-white font-semibold">Uploading...</span>
                                <span className="text-slate-400">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    </Card>
                )}

                <Button
                    onClick={handleSubmit}
                    disabled={pages.length === 0 || uploading}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-4 md:py-6 text-base md:text-lg font-semibold"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Processing ({progress}%)...
                        </>
                    ) : (
                        `Submit ${pages.length} Page${pages.length !== 1 ? 's' : ''} for Evaluation`
                    )}
                </Button>
            </div>
        </div>
    )
}

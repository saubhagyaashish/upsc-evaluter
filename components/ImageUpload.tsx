'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Camera, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { validateImage } from '@/lib/utils/imageValidation'

interface ImageUploadProps {
    onImageSelect: (file: File) => void
    preview: string | null
    onClearPreview: () => void
}

export default function ImageUpload({ onImageSelect, preview, onClearPreview }: ImageUploadProps) {
    const [dragActive, setDragActive] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFile = useCallback((file: File) => {
        setError(null)
        const validation = validateImage(file)

        if (!validation.valid) {
            setError(validation.error || 'Invalid file')
            return
        }

        onImageSelect(file)
    }, [onImageSelect])

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0])
        }
    }

    const handleCameraCapture = () => {
        if (fileInputRef.current) {
            fileInputRef.current.setAttribute('capture', 'environment')
            fileInputRef.current.click()
        }
    }

    const handleFileSelect = () => {
        if (fileInputRef.current) {
            fileInputRef.current.removeAttribute('capture')
            fileInputRef.current.click()
        }
    }

    if (preview) {
        return (
            <div className="relative">
                <img
                    src={preview}
                    alt="Answer preview"
                    className="w-full h-auto rounded-lg border-2 border-blue-500"
                />
                <Button
                    onClick={onClearPreview}
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${dragActive
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-600 bg-slate-800/50'
                    }`}
            >
                <ImageIcon className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-300 mb-6">
                    Drag and drop your answer sheet image here, or
                </p>

                <div className="flex gap-4 justify-center">
                    <Button
                        type="button"
                        onClick={handleFileSelect}
                        className="bg-blue-600 hover:bg-purple-700"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                    </Button>

                    <Button
                        type="button"
                        onClick={handleCameraCapture}
                        variant="outline"
                        className="border-blue-600 text-cyan-400 hover:bg-blue-600/10"
                    >
                        <Camera className="w-4 h-4 mr-2" />
                        Take Photo
                    </Button>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                />
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <p className="text-sm text-slate-400 text-center">
                Supported formats: JPG, PNG, HEIC, WEBP (Max 5MB)
            </p>
        </div>
    )
}

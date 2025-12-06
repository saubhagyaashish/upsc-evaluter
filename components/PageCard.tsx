'use client'

import { X, GripVertical } from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'

interface PageFile {
    id: string
    file: File
    preview: string
    order: number
}

interface PageCardProps {
    page: PageFile
    index: number
    totalPages: number
    onRemove: (id: string) => void
    onDragStart: (e: React.DragEvent, index: number) => void
    onDragOver: (e: React.DragEvent) => void
    onDrop: (e: React.DragEvent, index: number) => void
}

export default function PageCard({
    page,
    index,
    totalPages,
    onRemove,
    onDragStart,
    onDragOver,
    onDrop
}: PageCardProps) {
    return (
        <Card
            draggable
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, index)}
            className="relative p-3 bg-white/10 backdrop-blur-lg border-white/20 hover:border-blue-500 transition-all cursor-move group"
        >
            {/* Page Number Badge */}
            <div className="absolute top-2 left-2 z-10 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-semibold">
                Page {index + 1}
            </div>

            {/* Remove Button */}
            <button
                onClick={() => onRemove(page.id)}
                className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
                aria-label="Remove page"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Image Preview */}
            <div className="aspect-[3/4] overflow-hidden rounded-md mb-2 border-2 border-blue-500/50">
                <img
                    src={page.preview}
                    alt={`Page ${index + 1}`}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Drag Handle */}
            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs">
                <GripVertical className="w-4 h-4" />
                <span>Drag to reorder</span>
            </div>
        </Card>
    )
}

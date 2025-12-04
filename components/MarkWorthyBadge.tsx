'use client'

import { Badge } from '@/components/ui/badge'

interface MarkWorthyBadgeProps {
    type: 'MUST-WRITE' | 'HIGH-VALUE' | 'GOOD-TO-HAVE' | 'DATA'
    explanation: string
    marksValue?: number
}

export default function MarkWorthyBadge({ type, explanation, marksValue }: MarkWorthyBadgeProps) {
    const config = {
        'MUST-WRITE': {
            icon: '🎯',
            label: 'MUST-WRITE',
            color: 'bg-red-500/20 text-red-300 border-red-500/50',
            description: 'Essential for passing marks',
        },
        'HIGH-VALUE': {
            icon: '⭐',
            label: 'HIGH-VALUE',
            color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
            description: 'Bonus marks, shows depth',
        },
        'GOOD-TO-HAVE': {
            icon: '💡',
            label: 'GOOD-TO-HAVE',
            color: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
            description: 'Enhances answer quality',
        },
        DATA: {
            icon: '📊',
            label: 'DATA/STATS',
            color: 'bg-green-500/20 text-green-300 border-green-500/50',
            description: 'Facts strengthen argument',
        },
    }

    const { icon, label, color, description } = config[type]

    return (
        <div className="group relative inline-block">
            <Badge className={`${color} border px-2 py-1 text-xs font-medium cursor-help`}>
                <span className="mr-1">{icon}</span>
                {label}
                {marksValue && <span className="ml-1">({marksValue} marks)</span>}
            </Badge>

            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10 w-64">
                <div className="bg-slate-800 text-white text-xs rounded-lg p-3 shadow-lg border border-slate-600">
                    <div className="font-semibold mb-1">{description}</div>
                    <div className="text-slate-300">{explanation}</div>
                    <div className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-slate-800 border-r border-b border-slate-600"></div>
                </div>
            </div>
        </div>
    )
}

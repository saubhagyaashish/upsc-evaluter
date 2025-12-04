'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Upload, History, LogOut, Sparkles } from 'lucide-react'

export default function Navbar() {
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/generate', label: 'AI Generator', icon: Sparkles },
        { href: '/upload', label: 'Upload Answer', icon: Upload },
        { href: '/history', label: 'History', icon: History },
    ]

    return (
        <nav className="bg-gradient-to-r from-blue-900 to-cyan-900 border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-8">
                        <Link href="/dashboard" className="text-2xl font-bold text-white">
                            UPSC Evaluator
                        </Link>

                        <div className="hidden md:flex space-x-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${pathname === item.href
                                        ? 'bg-white/20 text-white'
                                        : 'text-white/70 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <Button
                        onClick={handleLogout}
                        variant="ghost"
                        className="text-white hover:bg-white/10"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </div>
        </nav>
    )
}

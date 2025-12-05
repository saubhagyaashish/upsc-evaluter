'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Upload, History, LogOut, Sparkles, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
    const pathname = usePathname()
    const router = useRouter()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/generate', label: 'AI Generator', icon: Sparkles },
        { href: '/upload', label: 'Upload', icon: Upload },
        { href: '/history', label: 'History', icon: History },
    ]

    return (
        <>
            {/* Desktop & Tablet Navigation */}
            <nav className="hidden md:block bg-gradient-to-r from-blue-900 to-cyan-900 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-8">
                            <Link href="/dashboard" className="text-xl lg:text-2xl font-bold text-white">
                                UPSC Evaluator
                            </Link>

                            <div className="flex space-x-4">
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

            {/* Mobile Top Bar */}
            <nav className="md:hidden bg-gradient-to-r from-blue-900 to-cyan-900 border-b border-white/10">
                <div className="px-4">
                    <div className="flex justify-between items-center h-14">
                        <Link href="/dashboard" className="text-lg font-bold text-white">
                            UPSC Evaluator
                        </Link>

                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/10"
                        >
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Tab Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-900 to-cyan-900 border-t border-white/10 z-50">
                <div className="grid grid-cols-4 h-16">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center gap-1 transition-all ${isActive
                                        ? 'text-white bg-white/10'
                                        : 'text-white/60 active:bg-white/5'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : ''}`} />
                                <span className="text-xs font-medium">{item.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* Add bottom padding to page content on mobile to account for fixed bottom nav */}
            <style jsx global>{`
                @media (max-width: 768px) {
                    main {
                        padding-bottom: 5rem;
                    }
                }
            `}</style>
        </>
    )
}

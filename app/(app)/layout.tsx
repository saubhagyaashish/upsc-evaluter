import Navbar from '@/components/Navbar'
import { Toaster } from 'sonner'

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
            <Toaster
                position="bottom-center"
                expand={false}
                richColors
                toastOptions={{
                    style: {
                        background: 'rgba(30, 41, 59, 0.95)',
                        color: '#fff',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        backdropFilter: 'blur(8px)',
                    },
                }}
            />
        </div>
    )
}

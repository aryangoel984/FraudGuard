import type React from "react"
import Link from "next/link"
import { Shield } from "lucide-react"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* Background glow for all inner pages */}
      <div className="pointer-events-none fixed inset-0 -z-10 flex justify-center">
        <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/50 backdrop-blur-xl">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <div className="mr-8 flex">
            <Link href="/" className="flex items-center space-x-2 transition-transform hover:scale-105">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg tracking-tight text-white">FraudGuard</span>
            </Link>
          </div>
          <nav className="flex flex-1 items-center justify-end space-x-6">
            <Link href="/dashboard" className="text-sm font-medium text-white/70 hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/rules" className="text-sm font-medium text-white/70 hover:text-primary transition-colors">
              Rules Engine
            </Link>
            <Link href="/api-docs" className="text-sm font-medium text-white/70 hover:text-primary transition-colors">
              API Docs
            </Link>
            <Link href="/api-testing" className="hidden sm:inline-flex text-sm font-medium text-white/70 hover:text-primary transition-colors">
              Sandbox
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 space-y-6 container mx-auto p-4 md:p-8 pt-6 relative z-10 animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  )
}


import type React from "react"
interface DashboardHeaderProps {
  heading: string
  description?: string
  children?: React.ReactNode
}

export function DashboardHeader({ heading, description, children }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2 pb-6 pt-2 border-b border-white/5 mb-6">
      <div className="grid gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
          {heading}
        </h1>
        {description && <p className="text-sm md:text-base text-white/50">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  )
}


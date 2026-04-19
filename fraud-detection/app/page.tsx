import Link from "next/link"
import { ArrowRight, BarChart3, Shield, Sliders, Terminal, Activity, Lock, Cpu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Dynamic Background Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/20 blur-[150px]" />
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

      <main className="flex-1">
        <section className="relative w-full py-20 md:py-32 lg:py-40">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary shadow-sm backdrop-blur-md">
                <Activity className="mr-2 h-4 w-4" />
                <span className="flex items-center gap-1">Real-time Threat Neutralization <span className="relative flex h-2 w-2 ml-1"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span></span></span>
              </div>
              <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-zinc-100 sm:text-5xl md:text-6xl lg:text-7xl">
                Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Fraud Detection</span> Platform
              </h1>
              <p className="max-w-[700px] text-lg text-white/60 md:text-xl leading-relaxed">
                Combine the power of probabilistic AI models with deterministic expert rules to stop bad actors instantly. Uncover hidden patterns with sub-100ms latency.
              </p>
              <div className="flex flex-col gap-4 min-[400px]:flex-row pt-4">
                <Link href="/dashboard">
                  <Button size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105 rounded-full">
                    View Live Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/rules">
                  <Button size="lg" variant="outline" className="h-12 px-8 border-white/10 hover:bg-white/5 font-semibold transition-all hover:scale-105 rounded-full backdrop-blur-sm">
                    Configure Rules
                    <Lock className="ml-2 h-4 w-4 text-white/50" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-20 bg-background/80 backdrop-blur-sm border-t border-white/5 relative z-10">
          <div className="container px-4 md:px-6">
            <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Platform Capabilities</h2>
              <p className="mt-4 text-white/60">Everything you need to secure your transaction pipeline.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "AI-Powered Analysis",
                  description: "Leverage Random Forests and Neural Networks to score transactions dynamically.",
                  icon: Cpu,
                  color: "text-primary",
                  link: "/dashboard"
                },
                {
                  title: "Custom Rules Engine",
                  description: "Deploy deterministic rules instantly. High transaction amount? Location mismatch? Block it.",
                  icon: Sliders,
                  color: "text-accent",
                  link: "/rules"
                },
                {
                  title: "Real-time Metrics",
                  description: "Monitor detection vs. reported rates in real-time through comprehensive dashboards.",
                  icon: BarChart3,
                  color: "text-green-400",
                  link: "/dashboard"
                },
                {
                  title: "API Integration",
                  description: "Test scoring models live via our interactive Sandbox and embed anywhere.",
                  icon: Terminal,
                  color: "text-orange-400",
                  link: "/api-testing"
                }
              ].map((feature, i) => (
                <Card key={i} className="group relative overflow-hidden bg-card/40 border-white/10 backdrop-blur-md transition-all hover:bg-card/60 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                  <CardHeader>
                    <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10 group-hover:ring-primary/50 transition-all">
                      <feature.icon className={`h-5 w-5 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-white/60 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href={feature.link} className="inline-flex items-center text-sm font-medium text-primary opacity-80 group-hover:opacity-100 transition-opacity">
                      Explore feature <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-background/90 py-8 relative z-10 backdrop-blur-md">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary opacity-70" />
            <p className="text-sm font-medium text-white/70">
              © {new Date().getFullYear()} FraudGuard Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}


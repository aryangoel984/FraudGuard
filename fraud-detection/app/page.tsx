import Link from "next/link"
import { ArrowRight, BarChart3, Shield, Sliders, Terminal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <span className="font-bold">FraudGuard</span>
            </Link>
          </div>
          <nav className="flex flex-1 items-center justify-end space-x-4">
            <Link href="/dashboard" className="text-sm font-medium">
              Dashboard
            </Link>
            <Link href="/rules" className="text-sm font-medium">
              Rules
            </Link>
            <Link href="/api-docs" className="text-sm font-medium">
              API Docs
            </Link>
            <Link href="/api-testing" className="text-sm font-medium">
              API Testing
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Fraud Detection, Alert, and Monitoring
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Combine the power of expert rules with AI models to detect frauds better. Monitor how your detection
                    is faring against actually reported errors.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/dashboard">
                    <Button className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
                      View Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-3">
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Real-time Fraud Detection</h3>
                      <p className="text-muted-foreground">
                        Process transactions in real-time with an average latency of less than 300ms.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Rule-based & AI Detection</h3>
                      <p className="text-muted-foreground">
                        Combine expert rules with AI models for better fraud detection.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Comprehensive Monitoring</h3>
                      <p className="text-muted-foreground">
                        Track and analyze fraud patterns with detailed dashboards and reports.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:grid-rows-2 lg:gap-12">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6" />
                    <CardTitle>Fraud Detection</CardTitle>
                  </div>
                  <CardDescription>Real-time and batch fraud detection APIs</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Detect fraudulent transactions in real-time with our powerful API that combines rule-based and
                    AI-powered detection.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/api-docs">
                    <Button variant="outline" size="sm">
                      Learn More
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sliders className="h-6 w-6" />
                    <CardTitle>Rule Configuration</CardTitle>
                  </div>
                  <CardDescription>Customize fraud detection rules</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Configure and fine-tune your fraud detection rules through an intuitive interface to adapt to
                    evolving fraud patterns.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/rules">
                    <Button variant="outline" size="sm">
                      Configure Rules
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-6 w-6" />
                    <CardTitle>Analytics Dashboard</CardTitle>
                  </div>
                  <CardDescription>Comprehensive fraud monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Monitor and analyze fraud patterns with detailed dashboards, reports, and visualizations.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">
                      View Dashboard
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Terminal className="h-6 w-6" />
                    <CardTitle>API Testing</CardTitle>
                  </div>
                  <CardDescription>Test fraud detection APIs</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Directly test the fraud detection APIs with sample data and view the results in real-time.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/api-testing">
                    <Button variant="outline" size="sm">
                      Test APIs
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 FraudGuard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}


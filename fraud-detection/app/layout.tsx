import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FraudGuard | Advanced Fraud Detection',
  description: 'AI-powered, real-time fraud detection platform for modern enterprises.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased selection:bg-primary/30`}>
        {children}
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Retail BI Dashboard',
  description: 'Business Intelligence Dashboard — Retail Analytics',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-flash: apply saved theme class before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('bi-theme')||'dark';document.documentElement.classList.toggle('dark',t==='dark');})()`,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}

import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Toodl - Interaktive Børnehistorier',
  description: 'Skab magiske, interaktive historier for børn med AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="da">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-playtale bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}

import { Suspense } from 'react'
import './globals.css'
import ConditionalLayout from '@/components/ConditionalLayout'

export const metadata = {
  title: 'YT Growth Centre - Support Creators',
  description: 'Daily tracking and promotion for YouTube channels',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Suspense fallback={<div style={{ padding: '2rem' }}>Prerendering App...</div>}>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Suspense>
      </body>
    </html>
  )
}




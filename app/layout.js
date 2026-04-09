import { Suspense } from 'react'
import './globals.css'
import ConditionalLayout from '@/components/ConditionalLayout'

export const metadata = {
  title: 'YT Growth Centre - Support Creators',
  description: 'Daily tracking and promotion for YouTube channels',
}

import { UIProvider } from '@/components/UIContext'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <UIProvider>
          <Suspense fallback={<div style={{ padding: '2rem' }}>Prerendering App...</div>}>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </Suspense>
        </UIProvider>
      </body>
    </html>
  )
}




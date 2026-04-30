import { Suspense } from 'react'
import './globals.css'
import ConditionalLayout from '@/components/ConditionalLayout'

export const metadata = {
  title: 'EasySell - YouTube Channel Supply Startup',
  description: 'EasySell helps high-volume buyers source YouTube channels for scalable marketing growth.',
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




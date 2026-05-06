import { Suspense } from 'react'
import './globals.css'
import ConditionalLayout from '@/components/ConditionalLayout'

export const metadata = {
  title: 'YTM Bangladesh - YouTube Channel Supply Network',
  description: 'YTM Bangladesh helps high-volume buyers source YouTube channels for scalable marketing growth.',
  icons: {
    icon: '/icons8-youtube-50.png',
  },
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




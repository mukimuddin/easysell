import { Suspense } from 'react'
import './globals.css'
import ConditionalLayout from '@/components/ConditionalLayout'

export const metadata = {
  title: 'YTM Bangladesh - Professional YouTube Channel Supply Network',
  description: 'YTM Bangladesh is the leading managed marketplace for high-volume YouTube channel sourcing, screening, and secure delivery. Optimized for agencies and strategic media operators.',
  keywords: 'YouTube channel marketplace, buy YouTube channels, YouTube sourcing Bangladesh, YTM Bangladesh, buy monetized channels, YouTube supply network, YouTube business, YTM',
  authors: [{ name: 'Mukim Uddin' }],
  openGraph: {
    title: 'YTM Bangladesh - YouTube Channel Supply Network',
    description: 'The most dependable and scalable ecosystem for YouTube channel demand. Built for high-volume buyers and professional growth.',
    url: 'https://ytmbd.work',
    siteName: 'YTM Bangladesh',
    images: [
      {
        url: '/icons8-youtube-50.png',
        width: 50,
        height: 50,
        alt: 'YTM Bangladesh Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YTM Bangladesh - YouTube Channel Supply Network',
    description: 'Managed marketplace for professional YouTube channel sourcing and delivery.',
    images: ['/icons8-youtube-50.png'],
  },
  icons: {
    icon: '/icons8-youtube-50.png',
    apple: '/icons8-youtube-50.png',
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




import './globals.css'
import Link from 'next/link'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'YT Marketplace - Buy & Sell Channels',
  description: 'List your channel and get buyers easily',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <nav className="navbar">
          <div className="nav-container">
            <Link href="/" className="logo">YTM.</Link>
            <div className="nav-links">
              <Link href="/admin" className="nav-link">Admin</Link>
            </div>
          </div>
        </nav>
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}


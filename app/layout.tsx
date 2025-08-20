import './css/style.css'
import './globals.css'
import '@ant-design/v5-patch-for-react-19';

import { Inter } from 'next/font/google'
import Theme from './theme-provider'
import AppProvider from './app-provider'
import { Analytics } from "@vercel/analytics/react"


const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata = {
  title: 'LeafyLab Platform',
  description: 'Data-sharing platform to accelerate the discovery, design, and adoption of biobased nanocomposite.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>{/* suppressHydrationWarning: https://github.com/vercel/next.js/issues/44343 */}
      <head>
        <meta name="apple-mobile-web-app-title" content="Biowrap" />
      </head>
      <body className="font-inter antialiased bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
        <Theme>
          <AppProvider>
            {children}
          </AppProvider>
        </Theme>
        <Analytics/>
      </body>
    </html>
  )
}
'use client'

import { ThemeProvider } from 'next-themes'
import { usePageTheme } from '@/lib/hooks/use-page-theme'

function ThemeContent({ children }: { children: React.ReactNode }) {
  // This will automatically handle page-specific theme switching
  usePageTheme()
  
  return <>{children}</>
}

export default function Theme({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange defaultTheme="dark" enableSystem={false} storageKey="leafylab-theme">
      <ThemeContent>
        {children}
      </ThemeContent>
    </ThemeProvider>
  )
}
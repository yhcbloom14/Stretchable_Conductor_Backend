'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'

// Pages that should use light mode by default
const LIGHT_MODE_PAGES = [
]

export function usePageTheme() {
  const { setTheme, theme } = useTheme()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Check if current path matches any light mode pages
    const shouldUseLightMode = LIGHT_MODE_PAGES.some(page => 
      pathname.startsWith(page)
    )

    if (shouldUseLightMode) {
      // Force light mode on light mode pages
      setTheme('light')
    }
    // Don't force dark mode on other pages - let user toggle freely
  }, [pathname, setTheme, mounted])

  const toggleTheme = () => {
    // Don't allow theme toggle on light mode pages
    const shouldUseLightMode = LIGHT_MODE_PAGES.some(page => 
      pathname.startsWith(page)
    )
    
    if (shouldUseLightMode) {
      return // Prevent theme toggle on light mode pages
    }
    
    // Allow theme toggle on all other pages
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }



  return {
    isLightModePage: LIGHT_MODE_PAGES.some(page => pathname.startsWith(page)),
    toggleTheme,
    mounted
  }
} 
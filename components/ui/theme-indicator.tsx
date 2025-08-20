'use client'

import { usePageTheme } from '@/lib/hooks/use-page-theme'
import { Button } from '@/components/ui/button'
import { Sun, Moon, RotateCcw } from 'lucide-react'

export function ThemeIndicator() {
  const { isLightModePage, userOverride, resetToPageDefault, mounted } = usePageTheme()

  if (!mounted) {
    return null // Don't show until mounted to avoid hydration issues
  }

  if (!isLightModePage && !userOverride) {
    return null // Don't show indicator on dark pages unless user has overridden
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 flex items-center gap-2">
        {isLightModePage ? (
          <Sun className="h-4 w-4 text-yellow-500" />
        ) : (
          <Moon className="h-4 w-4 text-blue-500" />
        )}
        <span className="text-sm font-medium">
          {isLightModePage ? 'Light Mode Page' : 'Dark Mode Page'}
          {userOverride && ' (Manual)'}
        </span>
        {userOverride && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetToPageDefault}
            className="h-6 w-6 p-0"
            title="Reset to page default"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
} 
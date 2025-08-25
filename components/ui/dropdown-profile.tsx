'use client'

import Link from 'next/link'

export default function DropdownProfile({ align }: {
  align?: 'left' | 'right'
}) {

  // Since the app is now publicly accessible, we don't automatically fetch user data
  // Users can still sign in if they want, but it's not required
  return (
    <div className="flex items-center space-x-3">
      <Link 
        href="/login" 
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        Sign In
      </Link>
    </div>
  )
}
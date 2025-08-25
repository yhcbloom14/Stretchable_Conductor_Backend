import ThemeToggle from '@/components/ui/theme-toggle'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Theme toggle in top left corner */}
      <div className="fixed top-4 left-4 z-50">
        <ThemeToggle />
      </div>
      
      {/* Main content */}
      <div className="min-h-screen">
        <div className='mt-16 flex flex-col'>
          {children}
        </div>
      </div>
    </div>
  )
}

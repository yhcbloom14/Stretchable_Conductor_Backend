import FormLayout from '@/components/auth/form-layout'
import Button from '@/components/common/button'

export default function NotFound() {
  return (
    <FormLayout
      title="Page not found"
      description="The page you're looking for doesn't exist"
      link={{prefix: "Need help?", text: "Contact support", href: "/contact"}}
    >
      <div className="bg-[#1c2438] border border-[#2a3349] rounded-lg p-6 shadow-lg">
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="h-24 w-24 rounded-full bg-[#1a2133] flex items-center justify-center">
              <div className="text-[#FF9800] text-6xl font-bold">404</div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-300">
              We couldn&apos;t find the page you were looking for. The page might have been removed, renamed, or is
              temporarily unavailable.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              text="Return home"
              variant="gradient"
              href="/"
            />
            <Button
              text="Go back"
              type="back"
            />
          </div>
        </div>
      </div>
    </FormLayout>
  )
}
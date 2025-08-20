import Link from "next/link"
import FormLayout from "@/components/auth/form-layout"
import Box from "@/components/common/box"
import Button from "@/components/common/button"
import SuccessIcon from "@/components/icons/success"

type SuccessPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SuccessPage({searchParams}: SuccessPageProps) {
  const title = (await searchParams).title as string
  const message = (await searchParams).message as string
  const resend_type = (await searchParams).resend_type as string
  const resend_email = (await searchParams).resend_email as string

  return (
    <FormLayout 
      title={title} 
      description={message} 
      link={{prefix: "Need help?", text: "Contact support", href: "/contact"}}
    >
      <Box level="1">
        <div className="space-y-6">
          <SuccessIcon />

          <div className="text-center space-y-4">
            <p className="text-gray-300">
              {message}.
            </p>

            {resend_type && resend_email && (
              <Box level="2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-gray-800 dark:text-gray-100">Didn&apos;t receive an email?</span> Check your spam folder or{" "}
                  <Link href={`/auth/resend-confirmation?resend_type=${encodeURIComponent(resend_type)}&resend_email=${encodeURIComponent(resend_email)}`} className="text-[#2196F3] hover:text-[#42a5f5] font-medium transition-colors">
                    click here to resend
                  </Link>
                </p>
              </Box>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="link"
              text="Return to login"
              href="/login"
              variant="gradient"
            />
          </div>
        </div>
      </Box>
    </FormLayout>
  )
}

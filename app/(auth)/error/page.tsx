import FormLayout from "@/components/auth/form-layout"
import Box from "@/components/common/box"
import Button from "@/components/common/button"
import ErrorIcon from "@/components/icons/error"

type ErrorPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ErrorPage({searchParams}: ErrorPageProps) {
  const rawErrors = (await searchParams).error;
  const title = (await searchParams).title as string || "Something went wrong"
  const message = (await searchParams).message as string || "We apologize for the inconvenience"
  const errors: string[] = Array.isArray(rawErrors)
    ? rawErrors
    : rawErrors
    ? [rawErrors]
    : ['An unexpected error occurred while processing your request. Our team has been notified and is working to resolve the issue.'];

  return (
    <FormLayout 
      title={title} 
      description={message} 
      link={{prefix: "Need help?", text: "Contact support", href: "/contact"}}
    >
      <Box level="1">
        <div className="space-y-6">
          <div className="flex justify-center">
            <ErrorIcon />
          </div>

          <ul className="space-y-2">
            {errors.map((error, i) => (
              <li key={`error-${i}`}>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  {decodeURIComponent(error)}
                </p>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              text="Return home"
              type="link"
              variant="gradient"
              href="/"
              size="medium"
            />
            <Button
              text="Go back"
              type="back"
              variant="default"
              size="medium"
            />
          </div>
        </div>
      </Box>
    </FormLayout>
  )
}

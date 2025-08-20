import ResetForm from "@/components/forms/reset-form"
import FormLayout from "@/components/auth/form-layout"

export default function Page() {
  return (
    <FormLayout 
      title="Forgot your password?" 
      description="Enter your email to reset your password" 
      link={{prefix: "Don't have an account?", text: "Create one", href: "/register"}}
    >
        <ResetForm />
    </FormLayout>
  )
}
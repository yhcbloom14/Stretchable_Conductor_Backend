import RegisterForm from "@/components/forms/register-form"
import FormLayout from "@/components/auth/form-layout"

export default function Page() {
  return (
    <FormLayout 
      title="Create an account" 
      description="Sign up to get started with our platform" 
      link={{prefix: "Already have an account", text: "Sign in", href: "/login"}}
    >
        <RegisterForm />
    </FormLayout>
  )
}


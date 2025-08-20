import LoginForm from "@/components/forms/login-form"
import FormLayout from "@/components/auth/form-layout"

export default function Page() {
  return (
    <FormLayout 
      title="Welcome back" 
      description="Sign in to your account to continue" 
      link={{prefix: "Don't have an account?", text: "Create one", href: "/register"}}
    >
        <LoginForm />
    </FormLayout>
  )
}

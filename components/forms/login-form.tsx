"use client"

import type React from "react"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { login } from "@/lib/actions/login"
import TextInput from "@/components/common/text-input"
import Button from "@/components/common/button"

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<{
    email?: string
    password?: string
    general?: string
  }>({})


  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)
    setFormErrors({})

    const formData = new FormData(event.currentTarget as HTMLFormElement)
    try {
      const { error:loginError, field } = await login(formData)
      if (loginError) {
        setFormErrors((prevErrors) => ({ ...prevErrors, [field || "general"]: loginError }))
      }
    } catch (error) {
      setFormErrors((prevErrors) => ({ ...prevErrors, general: 'Login failed. Please try again.' }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <TextInput label="Email" name="email" type="email" placeholder="name@example.com" disabled={isLoading} autoComplete="email" error={formErrors.email}/>
        <TextInput label="Password" name="password" type="password" disabled={isLoading} autoComplete="current-password" error={formErrors.password}>
          <a href="/forgot-password" className="text-sm font-medium text-[#2196F3] hover:text-[#42a5f5]">
            Forgot password?
          </a>
        </TextInput>
      </div>
      <Button
        type="submit"
        variant="gradient"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[#2a3349]"></span>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-gray-100 dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">Or continue with</span>
        </div>
      </div>
      {formErrors.general && <p className="text-xs text-[#FF5252] mt-1">{formErrors.general}</p>}
    </form>
  )
}

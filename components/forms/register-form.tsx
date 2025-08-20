"use client"

import type React from "react"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { signup } from '@/lib/actions/signup'
import TextInput from "@/components/common/text-input"
import Button from "@/components/common/button"
import Box from "@/components/common/box"

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
    terms?: string
    general?: string
  }>({})

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setFormErrors({})

    const formData = new FormData(event.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string
    // const terms = formData.get("terms") as string

    // Basic validation
    const errors: typeof formErrors = {}

    if (!name || name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters"
    }

    if (!email || !email.includes("@")) {
      errors.email = "Please enter a valid email address"
    }

    if (!password || password.length < 8) {
      errors.password = "Password must be at least 8 characters"
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    // if (!terms) {
    //   errors.terms = "You must agree to the terms and conditions"
    // }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setIsLoading(false)
      return
    }

    try {
      const {error: signupError, field} = await signup(formData)
      if (signupError) {
        setFormErrors((prevErrors) => ({ ...prevErrors, [field || "general"]: signupError }))
      }
      // Handle success, e.g., redirect or show a success message
    } catch (error) {
      // Handle error, e.g., show an error message
      setFormErrors((prevErrors) => ({ ...prevErrors, general: 'Signup failed. Please try again.' }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Box level="1">
        <div className="space-y-4">
          <TextInput label="Full Name" name="name" type="text" placeholder="John Doe" disabled={isLoading} autoCapitalize="words" autoComplete="name" error={formErrors.name}/>
          <TextInput label="Email" name="email" type="email" placeholder="name@example.com" disabled={isLoading} autoComplete="email" error={formErrors.email}/>
          <TextInput label="Password" name="password" type="password" disabled={isLoading} autoComplete="current-password" error={formErrors.password} instructions="Must be at least 8 characters"/>
          <TextInput label="Confirm Password" name="confirmPassword" type="password" disabled={isLoading} autoComplete="new-password" error={formErrors.confirmPassword}/>
        </div>
      </Box>
      <Button
        type="submit"
        variant="gradient"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create account"
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

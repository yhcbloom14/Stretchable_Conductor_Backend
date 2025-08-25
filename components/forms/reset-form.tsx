"use client"

import { useState, useEffect } from "react"
import { resetPasswordForEmail } from "@/lib/actions/reset-password"

import Box from "@/components/common/box"
import Button from "@/components/common/button"
import TextInput from "@/components/common/text-input"
import { redirect } from "next/navigation"
import { Loader2 } from "lucide-react"
import { isValidEmail } from "@/lib/validators/email"

export default function ResetForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [formErrors, setFormErrors] = useState<{
      email?: string
      general?: string
    }>({})

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setFormErrors({})

        const formData = new FormData(event.currentTarget)
        const email = formData.get("email") as string

        const errors: typeof formErrors = {}

        if (!isValidEmail(email)) {
            errors.email = "Please enter a valid email address"
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            setIsLoading(false)
            return
        }

        try {
            const {error: resetError, field} = await resetPasswordForEmail(formData)
            if (resetError) {
                setFormErrors((prevErrors) => ({ ...prevErrors, [field || "general"]: resetError }))
            }
        } catch (error) {
            setFormErrors((prevErrors) => ({ ...prevErrors, general: 'Reset password failed. Please try again.' }))
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <Box level="1">
                <div className="space-y-4">
                    <TextInput label="Email" name="email" type="email" placeholder="name@example.com" disabled={isLoading} autoComplete="email" error={formErrors.email}/>
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
                        Resetting password...
                    </>
                ) : (
                    "Reset password"
                )}
            </Button>
            {formErrors.general && <p className="text-xs text-[#FF5252] mt-1">{formErrors.general}</p>}
        </form>
    )
}

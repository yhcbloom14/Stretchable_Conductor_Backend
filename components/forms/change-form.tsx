"use client"

import { useState, useEffect } from "react"
import { changePassword } from "@/lib/actions/change-password"
import { redirect } from "next/navigation"

import Box from "@/components/common/box"
import Button from "@/components/common/button"
import TextInput from "@/components/common/text-input"
import { Loader2 } from "lucide-react"

export default function ChangeForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [formErrors, setFormErrors] = useState<{
        password?: string
        confirmPassword?: string
        general?: string
    }>({})  

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setFormErrors({})

        const formData = new FormData(event.currentTarget)
        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirmPassword") as string

        const errors: typeof formErrors = {}

        if (!password || password.length < 8) {
            errors.password = "Password must be at least 8 characters long"
        }

        if (password !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match"
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            setIsLoading(false)
            return
        }

        try {
            await changePassword(formData)
        } catch (error) {   
            setFormErrors((prevErrors) => ({ ...prevErrors, general: 'Password change failed. Please try again.' }))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <Box level="1">
                <div className="space-y-4">
                    <TextInput 
                        label="Password" 
                        name="password" 
                        type="password" 
                        disabled={isLoading} 
                        autoComplete="new-password" 
                        error={formErrors.password} 
                        instructions="Must be at least 8 characters"
                    />
                    <TextInput 
                        label="Confirm Password" 
                        name="confirmPassword" 
                        type="password" 
                        disabled={isLoading} 
                        autoComplete="new-password" 
                        error={formErrors.confirmPassword}
                    />
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
                        Changing password...
                    </>
                ) : (   
                    "Change password"
                )}
            </Button>
            {formErrors.general && (
                <p className="text-xs text-red-500 dark:text-[#FF5252] mt-1">{formErrors.general}</p>
            )}
        </form>
    )
}
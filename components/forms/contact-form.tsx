'use client'

import { useState } from "react"
import Box from "@/components/common/box"
import Button from "@/components/common/button"
import TextInput from "@/components/common/text-input"
import { Loader2 } from "lucide-react"
import { contactSupport } from "@/lib/actions/contact-support"
import TextAreaInput from "@/components/common/text-area-input"

export default function ContactForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [formErrors, setFormErrors] = useState<{
        email?: string
        message?: string
        general?: string
    }>({})

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setFormErrors({})

        const formData = new FormData(event.currentTarget)
        const email = formData.get("email") as string
        const message = formData.get("message") as string

        const errors: typeof formErrors = {}

        if (!email) {
            errors.email = "Email is required"
        }

        if (!message) {
            errors.message = "Message is required"
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            setIsLoading(false)
            return
        }

        try {
            const {error: contactError, field} = await contactSupport(formData)
            if (contactError) {
                setFormErrors((prevErrors) => ({ ...prevErrors, [field || "general"]: contactError }))
            }
        } catch (error) {
            setFormErrors((prevErrors) => ({ ...prevErrors, general: 'Failed to contact support. Please try again.' }))
        } finally {
            setIsLoading(false)
        }   
    }
    
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <Box level="1">
                <div className="space-y-4">
                    <TextInput label="Email" name="email" type="email" placeholder="name@example.com" disabled={isLoading} autoComplete="email" error={formErrors.email}/>
                    <TextAreaInput label="Message" name="message" error={formErrors.message}/>
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
                        Creating ticket...
                    </>
                ) : (   
                    "Create ticket"
                )}
            </Button>
            {formErrors.general && <p className="text-xs text-[#FF5252] mt-1">{formErrors.general}</p>}
        </form>
    )
}

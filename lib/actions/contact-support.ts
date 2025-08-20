'use server'

import { redirect } from "next/navigation"
import { isValidEmail } from "../validators/email"
import { ActionFieldError } from "../types/Action"
import { createClient } from "../utils/supabase/server"

export async function contactSupport(formData: FormData): Promise<ActionFieldError> {
    const supabase = await createClient()
    const data = {
        email: formData.get("email") as string,
        message: formData.get("message") as string
    }

    if (!isValidEmail(data.email)) {
        return {error: "Invalid email.", field: "email"}
    }

    if (!data.message) {
        return {error: "Message is required.", field: "message"}
    }

    try {
        await supabase.rpc('create_support_ticket', {user_email: data.email, user_message: data.message})
    } catch (error) {
        return {error: "Unable to create a support ticket at this time.", field: "general"}
    }

    //Create new support ticket
    
    redirect(`/success?title=${encodeURIComponent(`Support ticket created`)}&message=${encodeURIComponent(`We will get back to you as soon as possible`)}`)
}
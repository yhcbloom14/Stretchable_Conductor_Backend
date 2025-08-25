import { NextRequest } from "next/server"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/utils/supabase/server"

export async function GET(request: NextRequest) {
    const {searchParams} = new URL(request.url)
    const resend_type = searchParams.get('resend_type') as 'signup' | 'email_change'
    const resend_email = searchParams.get('resend_email') as string
    const title = searchParams.get('title') as string || "Resent confirmation link"
    const message = searchParams.get('message') as string || "We've sent a confirmation link to your email address. Please check your inbox and click the link to activate your account"

    console.log("At resend confirmation route")

    if (!resend_type || !resend_email) {
        redirect(`/error?error=${encodeURIComponent(`Missing or invalid resend link.`)}`)
    }

    const supabase = await createClient()

    const { error} = await supabase.auth.resend({
        email: resend_email,
        type: resend_type
    })

    if (error && error.code !== 'over_email_send_rate_limit') {
        redirect(`/error?error=${encodeURIComponent(`${error.status}: ${error.message}`)}`)
    }

    redirect(`/success?title=${encodeURIComponent(title)}&message=${encodeURIComponent(message)}&resend_type=${encodeURIComponent(resend_type)}&resend_email=${encodeURIComponent(resend_email)}`)
}
    

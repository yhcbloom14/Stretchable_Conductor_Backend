'use server'

import { createClient } from '@/lib/utils/supabase/server'
import { isValidEmail } from '../validators/email';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ActionFieldError } from '../types/Action';

export async function resetPasswordForEmail(formData: FormData): Promise<ActionFieldError> {
    const supabase = await createClient();

    const data = {
        email: formData.get('email') as string
    }

    if (!isValidEmail(data.email)) {
        return {error: "Invalid email.", field: "email"}
    }

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/change-password`
    })
    
    if (error) {
        redirect(`/error?error=${encodeURIComponent(`${error.status}: ${error.message}`)}`)
    }

    revalidatePath('/', 'layout')
    redirect(`/success?title=${encodeURIComponent("Password reset verification sent")}&message=${encodeURIComponent("We've sent a confirmation link to your email address. Please check your inbox and click the link to change your password")}`)
}
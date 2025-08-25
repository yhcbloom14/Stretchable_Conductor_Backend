'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/utils/supabase/server'
import { ActionFieldError } from '../types/Action'

export async function login(formData: FormData): Promise<ActionFieldError> {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: loginData, error } = await supabase.auth.signInWithPassword(data)

  if (error?.code === 'invalid_credentials') {
    return {error: "Invalid credentials", field: "password"}
  }

  if (error?.code === 'email_not_confirmed') {
    redirect(`/auth/resend-confirmation?resend_type=signup&resend_email=${encodeURIComponent(data.email)}&title=${encodeURIComponent("Email not confirmed")}&message=${encodeURIComponent("We've sent a confirmation link to your email address. Please check your inbox and click the link to activate your account")}`)
  }

  if (error) {
    redirect(`/error?error=${encodeURIComponent(`${error.status}: ${error.message}`)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

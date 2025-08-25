'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/utils/supabase/server'

import { checkEmail } from './check-email'
import { isValidEmail } from '../validators/email'
import { ActionFieldError } from '../types/Action'

export async function signup(formData: FormData): Promise<ActionFieldError> {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        name: formData.get('name') as string,
      }
    }
  }

  if (!isValidEmail(data.email)) {
    return {error: "Invalid email.", field: "email"}
  }

  //Check for unique emails
  const {data: emailExists } = await checkEmail(data.email)

  if (emailExists) {
    return {error: "Email is already in use.", field: "email"}
  }
  
  const { error } = await supabase.auth.signUp(data)
  
  if (error) {
    redirect(`/error?error=${encodeURIComponent(`${error.status}: ${error.message}`)}`)
  }
  
  revalidatePath('/', 'layout')
  redirect(`/success?title=${encodeURIComponent(`Registration successful`)}&message=${encodeURIComponent(`We've sent a confirmation link to your email address. Please check your inbox and click the link to activate your account`)}&resend_type=signup&resend_email=${encodeURIComponent(data.email)}`)
}
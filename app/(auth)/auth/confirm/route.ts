import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { createClient } from '@/lib/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('redirectUrl') ?? '/'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      // redirect user to specified redirect URL or root of app
      revalidatePath('/', 'layout')
      redirect(next)
    } else {
      redirect(`/error?error=${encodeURIComponent(`${error.status}: ${error.message}`)}`)
    }
  }

  // redirect the user to an error page with some instructions
  redirect(`/error?error=${encodeURIComponent(`Missing or invalid verification link.`)}`)
}
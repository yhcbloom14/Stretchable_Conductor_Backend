"use server"

import { createClient } from '@/lib/utils/supabase/server'

/*
Supabase does not throw an error when a user attempts to sign-up an email already connected to an account.
(This is a feature designed to prevent email scraping)
I would like to inform user if email is taken and that sign up will fail.
*/
export async function checkEmail(email: string) {
    const supabase = await createClient();
    
    // Try to check if email exists in profiles table
    const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle()
    
    if (error) {
        console.error('Error checking email:', error)
        // If there's an error, assume email doesn't exist to allow the flow to continue
        return { data: false }
    }
    
    return { data: !!data }
}
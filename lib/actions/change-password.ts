'use server'

import { createClient } from "@/lib/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function changePassword(formData: FormData) {
    const supabase = await createClient()

    const data = {
        password: formData.get("password") as string
    }

    const { error } = await supabase.auth.updateUser({
        password: data.password
    })

    if (error) {
        redirect(`/error?error=${encodeURIComponent(`${error.status}: ${error.message}`)}`)
    }

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
        redirect(`/error?error=${encodeURIComponent('Failed to get user information')}`)
    }

    // Check if user has an org_id in their metadata (from invite)
    let orgId = user.user_metadata?.org_id
    
    // If no org_id in metadata, look for pending invites
    if (!orgId) {
        const { data: pendingInvite, error: inviteError } = await supabase
            .from('invites')
            .select('org_id')
            .eq('invited_user_id', user.id)
            .eq('accepted', false)
            .eq('cancelled', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (!inviteError && pendingInvite) {
            orgId = pendingInvite.org_id
        }
    }
    
    if (orgId) {
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!profile) {
            // Create profile with org_id if it doesn't exist
            const { error: createError } = await supabase
                .from('profiles')
                .insert({
                    user_id: user.id,
                    email: user.email,
                    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                    org_id: orgId,
                    role: 'member' // Default role for invited users
                })

            if (createError) {
                console.error('Error creating profile:', createError)
                redirect(`/error?error=${encodeURIComponent('Failed to create user profile')}`)
            }
        } else {
            // Update existing profile with org_id if needed
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ org_id: orgId })
                .eq('user_id', user.id)
                .is('org_id', null) // Only update if org_id is null

            if (updateError) {
                console.error('Error updating profile:', updateError)
            }
        }

        // Mark any pending invites as accepted
        const { error: inviteUpdateError } = await supabase
            .from('invites')
            .update({ accepted: true })
            .eq('invited_user_id', user.id)
            .eq('org_id', orgId)
            .eq('accepted', false)

        if (inviteUpdateError) {
            console.error('Error updating invite:', inviteUpdateError)
        }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}
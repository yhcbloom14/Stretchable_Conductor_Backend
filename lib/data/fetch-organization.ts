"use server"

import { createClient } from "@/lib/utils/supabase/server";
import { getUserServer } from "../utils/supabase/get-user-server";

export async function fetchOrganization() {
    const supabase = await createClient()
    const user = await getUserServer()

    // If no user is authenticated, return null
    if (!user) {
        return null
    }

    // fetch org_id of current user
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('user_id', user.id)
        .single();

    if (profileError) {
        throw new Error(`${profileError.code}: ${profileError.message}`)
    }

    if (!profileData || !profileData.org_id) {
        // Handle the case where org_id is not found, perhaps redirect to an error page or return a default
        throw new Error('Organization ID not found for user.')
    }

    const { data: memberData, error: memberError } = await supabase
        .from('profiles')
        .select('id, role, email, name, last_sign_in_at')
        .eq('org_id', profileData.org_id)
        .order('id', { ascending: false })

    if (memberError) {
        throw new Error(`${memberError.code}: ${memberError.message}`)
    }
    const { data: inviteData, error: inviteError } = await supabase
    .from('invites')
    .select('id, role, profiles!invited_user_id(name, email)')
    .eq('org_id', profileData.org_id)
    .eq('accepted', false)
    .eq('cancelled', false)
    .order('created_at', { ascending: false })

    if (inviteError) {
        throw new Error(`${inviteError.code}: ${inviteError.message}`)
    }

    // Transform invite data to flat structure
    const invites = inviteData.map(invite => ({
        id: invite.id,
        email: 'email' in invite.profiles ? invite.profiles.email : invite.profiles[0].email,
        name: 'name' in invite.profiles ? invite.profiles.name : invite.profiles[0].name,
        role: invite.role,
        last_sign_in_at: null
    }))

    // fetch the organization name
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', profileData.org_id)
      .single()

    if (orgError) {
        throw new Error(`${orgError.code}: ${orgError.message}`)
    }

    return {...orgData, members: [...memberData, ...invites]}
}

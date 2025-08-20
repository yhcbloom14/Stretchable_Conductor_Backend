"use server"

import { createClient } from "../utils/supabase/server"
import { Invite } from "../types/Invite"
import { getUserServer } from "../utils/supabase/get-user-server"

export async function fetchInvites() {
    const supabase = await createClient()
    const user = await getUserServer()

    // If no user is authenticated, return empty array
    if (!user) {
        return []
    }

    const {data: invites, error: invitesError} = await supabase
    .from('invites')
    .select(`
        id,
        created_at, 
        org_id,
        profiles!invited_by(name, email),
        organizations!org_id(name)
    `)
    .eq('invited_user_id', user.id)
    .eq('accepted', false)
    .eq('cancelled', false)
    .order('created_at', {ascending: false})

    if (invitesError) {
        throw new Error(`${invitesError.code}: ${invitesError.message}`)
    }

    return invites.map(invite => ({
        id: invite.id,
        last_sign_in_at: invite.created_at,
        name: 'name' in invite.profiles ? invite.profiles.name : invite.profiles[0].name,
        email: 'email' in invite.profiles ? invite.profiles.email : invite.profiles[0].email,
        org_name: 'name' in invite.organizations ? invite.organizations.name : invite.organizations[0].name
    })) as Invite[]
}

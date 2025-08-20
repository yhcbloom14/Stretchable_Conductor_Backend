"use server"

import { createClient } from "../utils/supabase/server"
import { fetchProfile } from "../data/fetch-profile"
import { revalidatePath } from "next/cache"
import { getUserServer } from "../utils/supabase/get-user-server"

export async function joinOrganization(inviteId: string) {
    const supabase = await createClient()
    const profile = await fetchProfile()
    const user = await getUserServer()

    const {data: inviteData, error: inviteError} = await supabase
    .from('invites')
    .select('org_id')
    .eq('id', inviteId)
    .single()

    if (inviteError) {
        throw new Error(`${inviteError.code}: ${inviteError.message}`)
    }
    
    const {data: profileUpdateData, error: profileUpdateError} = await supabase
    .from('profiles')
    .update({org_id: inviteData?.org_id})
    .eq('id', profile.id)

    if (profileUpdateError) {
        throw new Error(`${profileUpdateError.code}: ${profileUpdateError.message}`)
    }

    const {data: inviteUpdateData, error: inviteUpdateError} = await supabase
    .from('invites')
    .update({accepted: true})
    .eq('id', inviteId)
    .eq('invited_user_id', user.id)

    if (inviteUpdateError) {
        throw new Error(`${inviteUpdateError.code}: ${inviteUpdateError.message}`)
    }

    revalidatePath('/', 'layout')
    return {success: true, message: 'Organization successfully joined.'}
}

"use server"

import { createClient } from "../utils/supabase/server"
import { getUserServer } from "../utils/supabase/get-user-server"
import { revalidatePath } from "next/cache"

export async function rejectInvite(inviteId: string) {
    const supabase = await createClient()
    const user = await getUserServer()
    
    const {data: inviteUpdateData, error: inviteUpdateError} = await supabase
    .from('invites')
    .update({accepted: false})
    .eq('id', inviteId)
    .eq('invited_user_id', user.id)

    if (inviteUpdateError) {
        throw new Error(`${inviteUpdateError.code}: ${inviteUpdateError.message}`)
    }
    
    revalidatePath('/join')
    return {success: true, message: 'Invitation successfully rejected.'}
}

'use server'

import { createClient } from "@/lib/utils/supabase/server"
import { fetchProfile } from "../data/fetch-profile"
import { Role } from "../types/Role"
import { revalidatePath } from "next/cache"

export async function cancelInvite(id: string) {
    const supabase = await createClient()
    const profile = await fetchProfile()

    if (profile.role !== Role.ADMIN) {
        throw new Error("You are not authorized to cancel invites.")
    }

    // TODO: invite not canceling
    const { data, error } = await supabase
    .from('invites')
    .update({cancelled: true})
    .eq('id', id)

    if (error) {
        throw new Error(`${error.code}: ${error.message}`)
    }

    revalidatePath('/', 'layout')
    return { success: true, message: 'Invite cancelled successfully' }
}
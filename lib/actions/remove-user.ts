"use server"

import { createClient } from "@/lib/utils/supabase/server"
import { fetchProfile } from "../data/fetch-profile"
import { Role } from "../types/Role"
import { revalidatePath } from "next/cache"

export async function removeUser(id: string) {
    const supabase = await createClient()
    const profile = await fetchProfile()

    if (profile.role !== Role.ADMIN) {
        throw new Error("You are not authorized to remove users.")
    }
    
    const { data, error } = await supabase
    .from('profiles')
    .update({org_id: null})
    .eq('id', id)
    
    if (error) {
        throw new Error(`${error.code}: ${error.message}`)
    }

    revalidatePath('/', 'layout')
    return { success: true, message: 'User successfully removed.' }

}

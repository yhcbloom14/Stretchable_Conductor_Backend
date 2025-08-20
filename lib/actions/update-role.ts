"use server"

import { createClient } from "@/lib/utils/supabase/server";
import { Role } from "../types/Role";
import { fetchProfile } from "../data/fetch-profile";

export async function updateRole(profileId: string, role: Role) {
    const supabase = await createClient()
    const profile = await fetchProfile()

    if (profile.role !== Role.ADMIN) {
        throw new Error("You are not authorized to update roles.")
    }

    const {data, error} = await supabase
        .from('profiles')
        .update({role: role})
        .eq('id', profileId)

    if (error) {
        throw new Error(`${error.code}: ${error.message}`)
    }

    return {success: true, message: 'Role updated successfully'}
}
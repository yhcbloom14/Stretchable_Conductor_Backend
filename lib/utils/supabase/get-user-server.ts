"use server"

import { createClient } from "@/lib/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getUserServer() {
    const supabase = await createClient()
    const {data, error} = await supabase.auth.getUser()
    if (error || !data.user) {
        // Return null instead of redirecting - site is now publicly accessible
        return null
    }
    revalidatePath('/', 'layout')
    return data.user
}

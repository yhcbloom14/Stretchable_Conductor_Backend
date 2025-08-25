"use server"

import { createClient } from "../utils/supabase/server"
import { fetchProfile } from "./fetch-profile"

export async function fetchFiles() {
    const supabase = await createClient()
    const profile = await fetchProfile()
    const org_id = profile.org_id;

    const {data: fileData, error: fileError} = await supabase
    .from("files")
    .select("id, created_at, name, template_id")
    .eq('org_id', org_id)
    .eq('is_deleted', false)
    .order('created_at', {ascending: true})


    if (fileError) {
        throw new Error(`${fileError.code}: ${fileError.message}`)
    }
    return fileData.map(file => ({
        ...file,
        createdTime: file.created_at,
        templateId: file.template_id,
        template_id: undefined
    }))
}
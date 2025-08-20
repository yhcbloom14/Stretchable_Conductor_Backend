"use server"

import { createClient } from "../utils/supabase/server";
import { fetchProfile } from "../data/fetch-profile";
import { getUserServer } from "../utils/supabase/get-user-server";
import { ActionResponse } from "../types/Action";

export async function uploadFile(file: File): Promise<ActionResponse> {
    const supabase = await createClient()
    const profile = await fetchProfile()
    const user = await getUserServer()

    // Check if user is authenticated
    if (!user) {
        throw new Error("Authentication required for file upload.")
    }

    // Check if profile exists
    if (!profile) {
        throw new Error("User profile not found.")
    }

    const orgId = profile.org_id
    // Trim the file extension from the name
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    
    const fileStorageName = `${fileName}+${orgId}+${Date.now()}`

    if (!orgId) {
        throw new Error("You must be apart of an organization to upload files.")
    }

    try {
        const { data: uploadData, error: uploadError} = await supabase.storage
        .from('csvs')
        .upload(fileStorageName, file)

        if (uploadError) {
            throw new Error(`Error: ${uploadError.message}`)
        }

        if (uploadData.path) {
            const {data: fileEntryData, error: fileEntryError} = await supabase
            .from("files")
            .insert({
                name: fileName,
                path: uploadData.path,
                org_id: orgId,
                created_by: user.id
            })

            if (fileEntryError) {
                throw new Error(`${fileEntryError.code}: ${fileEntryError.message}`)
            }
        } else {
            throw new Error("Failed to upload file.")
        }
    } catch {
        throw new Error("An unexpected error occurred during file upload.")
    }
    return {success: true, message: `${fileName} successfully uploaded.`}
}
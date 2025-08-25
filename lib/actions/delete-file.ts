"use server"

import { createClient } from "../utils/supabase/server"

export async function deleteFile(id: string) {
    const supabase = await createClient()

    const {data, error} = await supabase
    .from('files')
    .update({is_deleted: true})
    .eq('id', id)

    if (error) {
        throw new Error(`${error.code}: ${error.message}`)
    }

    return {success: true, message: 'File deleted successfully.'}
}

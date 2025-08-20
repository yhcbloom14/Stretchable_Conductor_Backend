"use server"

import { createClient } from "../utils/supabase/server";
import { fetchProfile } from "../data/fetch-profile";
import { OutputView } from "../types/Output";

export async function saveResult(outputs: Record<string, number>, templateId: string, view: OutputView) {
    const supabase = await createClient()
    const profile = await fetchProfile()

    const {data: resultData, error: resultError} = await supabase
    .from("results")
    .insert({
        created_by: profile.id,
        view: view,
        template_id: templateId,
        outputs: JSON.stringify(outputs),
    })

    if (resultError) {
        throw new Error(`Error: ${resultError.message}`)
    }

    return {success: true, message: "Result saved successfully."}
}
    

"use server"

import { OutputView } from "../types/Output";
import { createClient } from "../utils/supabase/server";

export async function fetchResults(templateId: string, view: OutputView) {
    const supabase = await createClient()

    const {data: results, error: resultsError} = await supabase
    .from("results")
    .select("id, created_at, created_by, outputs")
    .eq("template_id", templateId)
    .eq("view", view)
    .order("created_at", {ascending: false})

    if (resultsError) {
        throw new Error(`${resultsError.name}: ${resultsError.message}`)
    }

    return results
}
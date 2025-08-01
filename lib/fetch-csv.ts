"use server";

import { parseCSV } from "@/components/utils/parse-csv";
import { createClient } from "../utils/supabase/server";

export async function fetchCsv(fileId: string) {
    const supabase = await createClient();

    const {data: fileData, error: fileError} = await supabase
    .from("files")
    .select("path")
    .eq('id', fileId)
    .single()

    if (fileError) {
        throw Error(`${fileError.name}: ${fileError.message}`);
    }

    const {data: downloadData, error: downloadError} = await supabase.storage
    .from("csvs")
    .download(fileData?.path)

    if (downloadError) {
        throw Error(`${downloadError.name}: ${downloadError.message}`);
    }

    //Parse csv
    return {data: parseCSV(await downloadData?.text() as string), id: fileId}
}
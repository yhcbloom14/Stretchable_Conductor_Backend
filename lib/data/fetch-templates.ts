"use server"

import { Template } from "../types/Template";
import { createClient } from "../utils/supabase/server";
import { fetchProfile } from "./fetch-profile";
import path from "path"
import { promises as fs } from "fs"

function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return ''; 
  }
  return process.env.NEXT_PUBLIC_DEPLOY_URL || 'http://localhost:3000';
}

export async function fetchTemplates(): Promise<Template[]> {
  const templates: Template[] = [];

  // Define your template files (relative to public/)
  const templateFiles = [
    {
      id: "82676d1e-075f-45f6-bb52-1c2f172d5458",
      name: "Stretchable Electrode",
      file: "property-template.json", // this should be in your /public/ directory
    },
    // Add more templates here if needed
    // { id: "...", name: "Binder Template", file: "binder-template.json" },
  ];

  for (const tmpl of templateFiles) {
    try {
      // Use NEXT_PUBLIC_DEPLOY_URL to form absolute URL
      const baseUrl = getBaseUrl();

      const res = await fetch(`${baseUrl}/${tmpl.file}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch ${tmpl.file}: ${res.statusText}`);
      }

      const json = await res.json();

      templates.push({
        ...json,
        id: tmpl.id,
        name: tmpl.name,
      });
    } catch (error) {
      console.error(`Error loading template "${tmpl.name}":`, error);
    }
  }

  return templates;
}


// export async function fetchTemplates(): Promise<Template[]> {
//     const supabase = await createClient();
//     const profile = await fetchProfile()
//     const org_id = profile.org_id;

//     const {data: templateList, error: templateListError} = await supabase
//     .from("templates")
//     .select("id, name, path")
//     .eq("org_id", org_id)
//     .eq("is_deleted", false)
//     .order('created_at', {ascending: true})

//     if (templateListError) {
//         throw Error(`${templateListError.name}: ${templateListError.message}`);
//     }

//     const templates: Template[] = [];

//     for (const template of templateList) {
//         const {data: downloadData, error: downloadError} = await supabase.storage
//             .from("templates")
//             .download(template.path)

//         if (!res.ok) {
//             throw Error(`${downloadError.name}: ${downloadError.message}`);
//         }

//         const fileContents = await downloadData?.text();

//         if (!fileContents) {
//             throw Error(`No template found for ${template.name}`);
//         }

//         try {
//             templates.push({
//                 ...JSON.parse(fileContents),
//                 id: template.id,
//                 name: template.name,
//             });
//         } catch (error) {
//             throw error;
//         }
//     }

//     return templates;
// }


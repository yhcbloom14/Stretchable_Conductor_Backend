"use server"

import { createClient } from "../utils/supabase/server";
import { fetchProfile } from "../data/fetch-profile";
import { getUserServer } from "../utils/supabase/get-user-server";
import { ActionResponse } from "../types/Action";
import { FileType, FileCategory, ExtendedFileData } from "../types/File";

import { processDefectFile } from "../data/defects";

// File type detection from MIME type
function getFileTypeFromMime(mimeType: string): FileType {
    if (mimeType.includes('csv') || mimeType.includes('text/csv')) return FileType.CSV
    if (mimeType.includes('pdf')) return FileType.PDF  
    if (mimeType.includes('json')) return FileType.JSON
    if (mimeType.includes('xlsx') || mimeType.includes('spreadsheet')) return FileType.XLSX
    if (mimeType.includes('image/')) return FileType.IMAGE
    return FileType.CSV // Default fallback
}

// Get storage bucket based on file category
function getStorageBucket(category: FileCategory): string {
    switch (category) {
        case FileCategory.DEFECTS: return 'defect-files'  
        case FileCategory.MATERIALS: return 'csvs' // Keep existing bucket for backwards compatibility
        default: return 'general-files'
    }
}

// Validate file based on category
function validateFile(file: File, category: FileCategory): { valid: boolean; error?: string } {
    const maxSizes = {
        [FileCategory.DEFECTS]: 10 * 1024 * 1024,     // 10MB for JSON
        [FileCategory.MATERIALS]: 5 * 1024 * 1024,    // 5MB for CSV
        [FileCategory.GENERAL]: 20 * 1024 * 1024      // 20MB general
    }

    const allowedTypes = {
        [FileCategory.DEFECTS]: ['application/json', 'text/json'],
        [FileCategory.MATERIALS]: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        [FileCategory.GENERAL]: ['application/pdf', 'application/json', 'text/csv', 'image/png', 'image/jpeg']
    }

    if (file.size > maxSizes[category]) {
        return { valid: false, error: `File size exceeds ${maxSizes[category] / (1024 * 1024)}MB limit` }
    }

    if (!allowedTypes[category].includes(file.type)) {
        return { valid: false, error: `File type ${file.type} not allowed for ${category}` }
    }

    return { valid: true }
}



// Process defect JSON files
async function processDefectJSON(
    file: File,
    organizationId: string,
    userId: string
): Promise<{ batch_id?: string; processing_status: string }> {
    try {
        const fileContent = await file.text()
        const defectFileData = JSON.parse(fileContent)
        
        // Validate required fields
        const requiredFields = ['batch_name', 'product_name', 'batch_number', 'scan_date', 'defects']
        for (const field of requiredFields) {
            if (!defectFileData[field]) {
                throw new Error(`Missing required field: ${field}`)
            }
        }

        const result = await processDefectFile(organizationId, userId, defectFileData)
        return { batch_id: result.batch.id, processing_status: 'completed' }
    } catch (error) {
        console.error('Error processing defect JSON:', error)
        return { processing_status: 'failed' }
    }
}

export async function uploadFileEnhanced(
    file: File, 
    category: FileCategory,
    metadata?: Record<string, any>
): Promise<ActionResponse & { fileData?: ExtendedFileData }> {
    const supabase = await createClient()
    const profile = await fetchProfile()
    const user = await getUserServer()

    const orgId = profile.org_id
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    const fileExtension = file.name.split('.').pop() || ''
    const fileType = getFileTypeFromMime(file.type)
    const bucket = getStorageBucket(category)
    
    if (!orgId) {
        return { success: false, message: "You must be part of an organization to upload files." }
    }

    // Validate file
    const validation = validateFile(file, category)
    if (!validation.valid) {
        return { success: false, message: validation.error || "Invalid file" }
    }

    const fileStorageName = `${fileName}_${orgId}_${Date.now()}.${fileExtension}`

    try {
        // Upload file to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileStorageName, file)

        if (uploadError) {
            throw new Error(`Upload error: ${uploadError.message}`)
        }

        if (!uploadData.path) {
            throw new Error("Failed to upload file.")
        }

        // Process file based on category
        let processing_result: { batch_id?: string; processing_status: string } = {
            processing_status: 'completed'
        }

        if (category === FileCategory.DEFECTS && fileType === FileType.JSON) {
            processing_result = await processDefectJSON(file, orgId, user.id)
        }

        // Create extended file entry
        const extendedFileData: Omit<ExtendedFileData, 'id' | 'created_at' | 'updated_at'> = {
            name: fileName,
            path: uploadData.path,
            size: file.size,
            type: fileType,
            category: category,
            mime_type: file.type,
            metadata: metadata || {},
            organization_id: orgId,
            created_by: user.id,
            processing_status: processing_result.processing_status as any,
            batch_id: processing_result.batch_id
        }

        // For backwards compatibility, also insert into existing files table for CSV
        if (category === FileCategory.MATERIALS && fileType === FileType.CSV) {
            const { error: fileEntryError } = await supabase
                .from("files")
                .insert({
                    name: fileName,
                    path: uploadData.path,
                    org_id: orgId,
                    created_by: user.id
                })

            if (fileEntryError) {
                console.warn("Warning: Could not create legacy file entry:", fileEntryError.message)
            }
        }

        return {
            success: true,
            message: `${fileName} successfully uploaded and processed.`,
            fileData: extendedFileData as ExtendedFileData
        }

    } catch (error) {
        console.error("File upload error:", error)
        return {
            success: false,
            message: error instanceof Error ? error.message : "An unexpected error occurred during file upload."
        }
    }
}



export async function uploadDefectDataJSON(file: File): Promise<ActionResponse & { batch_id?: string }> {
    const result = await uploadFileEnhanced(file, FileCategory.DEFECTS)
    return {
        ...result,
        batch_id: result.fileData?.batch_id
    }
}

export async function uploadMaterialsCSV(file: File, templateId?: string): Promise<ActionResponse> {
    const result = await uploadFileEnhanced(file, FileCategory.MATERIALS, { templateId })
    return result
}
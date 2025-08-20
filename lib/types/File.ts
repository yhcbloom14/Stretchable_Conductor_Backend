import { CsvData } from "./CSV"

export interface FileData {
    id: string
    name: string
    createdTime: string
    templateId: string
    data?: CsvData
}

export enum FileType {
    CSV = 'csv',
    PDF = 'pdf',
    JSON = 'json',
    XLSX = 'xlsx',
    IMAGE = 'image'
}

export enum FileCategory {
    MATERIALS = 'materials',
    DEFECTS = 'defects',
    GENERAL = 'general'
}

export interface ExtendedFileData {
    id: string
    name: string
    path: string
    size: number
    type: FileType
    category: FileCategory
    mime_type: string
    metadata?: Record<string, any>
    organization_id: string
    created_by: string
    created_at: Date
    updated_at: Date
    
    // Processing status
    processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
    processing_error?: string
    
    // Relations
    batch_id?: string  // For defect data files
    template_id?: string  // For materials CSV files
}
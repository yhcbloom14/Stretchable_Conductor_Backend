"use client"

import React, { useState, useRef } from 'react'
import { Upload, File, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { FileCategory, FileType } from '@/lib/types/File'
import { uploadFileEnhanced, uploadDefectDataJSON, uploadMaterialsCSV } from '@/lib/actions/upload-file-enhanced'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'



interface EnhancedFileInputProps {
  category: FileCategory
  onUploadSuccess?: (result: any) => void
  onUploadError?: (error: string) => void
  className?: string

}

interface FileUploadState {
  file: File | null
  uploading: boolean
  progress: number
  status: 'idle' | 'uploading' | 'success' | 'error'
  message: string
}

const getAcceptedFileTypes = (category: FileCategory): string => {
  switch (category) {
    case FileCategory.DEFECTS:
      return '.json'
    case FileCategory.MATERIALS:
      return '.csv,.xlsx'
    case FileCategory.GENERAL:
      return '.pdf,.json,.csv,.xlsx,.png,.jpg,.jpeg'
    default:
      return '*'
  }
}

const getFileTypeDescription = (category: FileCategory): string => {
  switch (category) {
    case FileCategory.DEFECTS:
      return 'Upload JSON files containing defect detection data'
    case FileCategory.MATERIALS:
      return 'Upload CSV or Excel files with materials data'
    case FileCategory.GENERAL:
      return 'Upload various file types'
    default:
      return 'Select a file to upload'
  }
}

const getMaxFileSize = (category: FileCategory): string => {
  switch (category) {
    case FileCategory.DEFECTS:
      return '10MB'
    case FileCategory.MATERIALS:
      return '5MB'
    case FileCategory.GENERAL:
      return '20MB'
    default:
      return '5MB'
  }
}

export default function EnhancedFileInput({
  category,
  onUploadSuccess,
  onUploadError,
  className = ''
}: EnhancedFileInputProps) {
  const [uploadState, setUploadState] = useState<FileUploadState>({
    file: null,
    uploading: false,
    progress: 0,
    status: 'idle',
    message: ''
  })


  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadState(prev => ({
      ...prev,
      file,
      status: 'idle',
      message: `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
    }))


  }

  const handleUpload = async () => {
    if (!uploadState.file) return

    setUploadState(prev => ({
      ...prev,
      uploading: true,
      status: 'uploading',
      message: 'Uploading file...',
      progress: 0
    }))

    try {
      let result

      // Use specific upload functions based on category
      switch (category) {
        case FileCategory.DEFECTS:
          result = await uploadDefectDataJSON(uploadState.file)
          break
        case FileCategory.MATERIALS:
          result = await uploadMaterialsCSV(uploadState.file, metadata.templateId as string)
          break
        default:
          result = await uploadFileEnhanced(uploadState.file, category, metadata)
      }

      if (result.success) {
        setUploadState(prev => ({
          ...prev,
          uploading: false,
          status: 'success',
          message: result.message,
          progress: 100
        }))
        onUploadSuccess?.(result)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        status: 'error',
        message: errorMessage,
        progress: 0
      }))
      onUploadError?.(errorMessage)
    }
  }

  const resetUpload = () => {
    setUploadState({
      file: null,
      uploading: false,
      progress: 0,
      status: 'idle',
      message: ''
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const renderStatusIcon = () => {
    switch (uploadState.status) {
      case 'uploading':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Upload className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="p-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            {renderStatusIcon()}
          </div>
          
          <h3 className="text-lg font-semibold mb-2">
            {category.charAt(0).toUpperCase() + category.slice(1)} File Upload
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            {getFileTypeDescription(category)}
          </p>
          
          <p className="text-xs text-gray-500 mb-4">
            Maximum file size: {getMaxFileSize(category)}
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept={getAcceptedFileTypes(category)}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploadState.uploading}
          />

          <div className="space-y-3">
            {!uploadState.file ? (
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full"
              >
                <File className="h-4 w-4 mr-2" />
                Select File
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">
                      {uploadState.file.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={resetUpload}
                      disabled={uploadState.uploading}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {uploadState.status === 'uploading' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadState.progress}%` }}
                    />
                  </div>
                )}

                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploadState.uploading || (showMetadataForm && !metadata.title)}
                  className="w-full"
                >
                  {uploadState.uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {uploadState.message && (
            <p className={`text-sm mt-3 ${
              uploadState.status === 'error' ? 'text-red-600' : 
              uploadState.status === 'success' ? 'text-green-600' : 
              'text-gray-600'
            }`}>
              {uploadState.message}
            </p>
          )}
        </div>
      </Card>



    </div>
  )
}
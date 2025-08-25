"use client"

import { useFlyoutContext } from "@/app/flyout-context"
import FileSidebarItem from "./file-sidebar-item"
import FileInput from "@/components/common/file-input"
import { useState, useRef } from "react"
import { parseCSV } from "@/components/utils/parse-csv"
import toast from "react-hot-toast"
import { uploadFile } from "@/lib/actions/upload-file"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { fileSlice, refreshFiles } from "@/lib/store/slices/fileSlice"
import { useEffect } from "react"
import { refreshTemplates, selectTemplates } from "@/lib/store/slices/templateSlice"
import { SkeletonSidebar } from "@/components/common/skeleton-data"
import Link from "next/link"
import { isFeatureEnabled, getFeatureDisabledReason } from "@/lib/constants"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"

interface FileSidebarProps {
  activeId: string
}

export default function FileSidebar({activeId}: FileSidebarProps) {
    const { flyoutOpen, setFlyoutOpen } = useFlyoutContext()
    const [isUploading, setIsUploading] = useState(false);
    const initialized = useRef(false);

    const dispatch = useAppDispatch();
    const files = useAppSelector(fileSlice.selectors.selectFiles);
    const isLoading = useAppSelector(fileSlice.selectors.selectLoading);
    const templates = useAppSelector(selectTemplates);
    const fileUploadDisabledReason = getFeatureDisabledReason('FILE_UPLOADS');

    useEffect(() => {
        // Only initialize once per app session
        if (!initialized.current) {
            initialized.current = true;
            
            // Only fetch files if we don't have any cached
            if (files.length === 0) {
                dispatch(refreshFiles(false));
            }
            // Only fetch templates once on mount
            dispatch(refreshTemplates(false));
        }
    }, [dispatch, files.length]) // Keep files.length but use ref to prevent re-initialization

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;
      
      const file = files[0];
      
      // Check if file is a CSV
      if (!file.name.endsWith('.csv')) {
        toast.error("Please upload a CSV file.");
        return;
      }
      
      setIsUploading(true);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvContent = e.target?.result as string;
          const parsedData = parseCSV(csvContent);
          
          if (parsedData.headers.length === 0) {
            toast.error("Could not parse CSV file. Please check the format.");
            setIsUploading(false);
            return;
          }
        } catch (error) {
          toast.error("Error parsing CSV file.");
        } finally {
          setIsUploading(false)
          // Clear the file input
          event.target.value = "";
        }
      };
      
      reader.onerror = () => {
        toast.error("Error reading file.");
        setIsUploading(false);
      };
      
      reader.readAsText(file);
      //upload file...
      toast.promise(
        uploadFile(file),
        {
            loading: "Uploading...",
            success: (response) => {
                dispatch(refreshFiles(true)); // Force refresh after upload
                return `${response.message}`
            },
            error: (error) => `${error.message}`
        }
      )
    };

    if (isLoading) {
        return (
            <div id="file-sidebar" className={`absolute z-20 top-0 bottom-0 w-full md:w-auto md:static md:top-auto md:bottom-auto -mr-px md:translate-x-0 transition-transform duration-200 ease-in-out ${flyoutOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SkeletonSidebar />
            </div>
        )
    }

    return (
        <TooltipProvider>
            <div id="file-sidebar" className={`absolute z-20 top-0 bottom-0 w-full md:w-auto md:static md:top-auto md:bottom-auto -mr-px md:translate-x-0 transition-transform duration-200 ease-in-out ${flyoutOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="sticky top-16 bg-white dark:bg-[#151D2C] overflow-x-hidden overflow-y-auto no-scrollbar shrink-0 border-r border-gray-200 dark:border-gray-700/60 md:w-[18rem] xl:w-[20rem] h-[calc(100dvh-64px)]">
        {/* Profile group */}
        <div>
          {/* Group header */}
          <div className="sticky top-0 z-10">
            <div className="flex items-center bg-white dark:bg-[#151D2C] border-b border-gray-200 dark:border-gray-700/60 p-5">
              <div className="w-full flex flex-col justify-between gap-y-3">
                {/* Profile image */}
                <div className="relative">
                  <div className="grow flex items-center truncate">
                    <div className="truncate">
                      <span className="font-semibold text-gray-800 dark:text-gray-100">Data Organization Tab</span>
                    </div>
                  </div>
                </div>
                {/* Upload button */}
                <div className="flex">
                    {isFeatureEnabled('FILE_UPLOADS') ? (
                        <FileInput handleFileUpload={handleFileUpload} disabled={isUploading}/>
                    ) : (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="inline-block cursor-not-allowed">
                                    <FileInput handleFileUpload={() => {}} disabled={true}/>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{fileUploadDisabledReason || "Feature is disabled"}</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
              </div>
            </div>
          </div>
          {/* Group body */}
          <div className="px-5 py-4">
            {/* Templates Section */}
            <div className="mt-4">
              <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-3">Templates</div>
              <ul className="mb-6">
                {
                  templates.map((template, i) => (
                    <li key={`template-${i}`} className="mb-2">
                      <Link href={`/data/template-${template.id}`} className={`flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 ${
                        activeId === `template-${template.id}` ? 'bg-violet-50 dark:bg-violet-900/20' : ''
                      }`}>
                        <div className="w-6 h-6 rounded bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-violet-600 dark:text-violet-400">T</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{template.name}</span>
                        </div>
                      </Link>
                    </li>
                  ))
                }
              </ul>
            </div>
            
            {/* Datasets Section */}
            <div className="mt-4">
              <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-3">Datasets</div>
              <ul className="mb-6">
                {
                  files
                    .slice() // Create a copy to avoid mutating the original array
                    .sort((a, b) => {
                      // Sort by createdTime in descending order (most recent first)
                      const timeA = new Date(a.createdTime || 0).getTime();
                      const timeB = new Date(b.createdTime || 0).getTime();
                      return timeB - timeA;
                    })
                    .map((file, i) => (
                      <FileSidebarItem key={`file-${file.id}`} file={file} isActive={activeId === file.id && !activeId.startsWith('template-')}/>
                    ))
                }
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
        </TooltipProvider>
  )
}

"use client"

import { useMemo } from "react";
import { FileText } from "lucide-react";
import ActionMenu from "@/components/common/action-menu";
import { ActionEnum } from "@/lib/types/Action";
import { FileData } from "@/lib/types/File";
import { deleteFile } from "@/lib/actions/delete-file";
import { refreshFiles } from "@/lib/store/slices/fileSlice";
import { selectTemplateNameById } from "@/lib/store/slices/templateSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { isFeatureEnabled } from "@/lib/constants";

interface FileSidebarItemProps {
    file: FileData
    isActive: boolean
}

export default function FileSidebarItem({file, isActive}: FileSidebarItemProps) {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const templateName = useAppSelector(state => selectTemplateNameById(state)(file.templateId))

    const changeFile = () => {
        router.push(`/data/${file.id}`)
    }

    const handleDeleteFile = () => {
        return async () => {
            toast.promise(
                deleteFile(file.id),
                {
                    loading: "Deleting user...",
                    success: (response) => {
                        return `${file.name} successfully deleted.`
                    },
                    error: (error) => `${error.message}`
                }
            )
            dispatch(refreshFiles(true)) // Force refresh after delete
        }
    }
    const createdDateTime = useMemo(() => {
        return file.createdTime ? new Date(file.createdTime).toLocaleString() : "Unknown"
    }, [file.createdTime])
    return (
        <li 
            className={
            `group flex items-center justify-between rounded-md mb-1 cursor-pointer transition-colors hover:bg-gray-500/20 ${isActive && 'bg-gray-500/20'}`
            }
        >
            <div 
                className="flex items-center p-2 flex-1"
                onClick={changeFile}
            >
                <FileText className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0" />
                <div className="flex flex-col">
                    <span className="text-sm font-medium truncate">
                        {file.name}
                    </span>
                    {createdDateTime && (
                        <span className="text-xs text-gray-400">
                            {createdDateTime}
                        </span>
                    )}
                </div>
            </div>
            
            {isFeatureEnabled('FILE_DELETES') && (
                <div className="opacity-0 group-hover:opacity-100 flex pr-2">
                    <ActionMenu align="left" actions={[{type: ActionEnum.DELETE, label: 'Delete', handler: handleDeleteFile()}]}/>
                </div>
            )}
        </li>
    );
}

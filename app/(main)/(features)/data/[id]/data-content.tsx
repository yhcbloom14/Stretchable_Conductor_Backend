"use client"

import { useFlyoutContext } from "@/app/flyout-context";
import Title from "@/components/common/title";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { fileSlice, getFileData } from "@/lib/store/slices/fileSlice";
import { selectTemplates } from "@/lib/store/slices/templateSlice";
import { CategoricalFeature } from "@/lib/types/Template";
import Container from "@/components/common/container";
import Table from "@/components/common/table/table";
import { ActionEnum } from "@/lib/types/Action";
import TemplateBadge from "@/components/common/template-badge";

import { downloadCSV } from "@/components/utils/parse-csv";
import { useEffect, useMemo } from "react";
import { ColumnEnum, Column } from "@/lib/types/Column";
import toast from "react-hot-toast";
import { SkeletonTable, SkeletonTitle } from "@/components/common/skeleton-data";
import binderTranslations from "@/lib/data/mock/binder-template-translation.json";

interface DataContentProps {
    activeId: string
}

export default function DataContent({activeId}: DataContentProps) {
    const { flyoutOpen, setFlyoutOpen } = useFlyoutContext()
    const dispatch = useAppDispatch();

    const files = useAppSelector(fileSlice.selectors.selectFiles)
    const templates = useAppSelector(selectTemplates)
    const isFileDataLoading = useAppSelector(fileSlice.selectors.selectFileDataLoading)(activeId)
    
    // Check if activeId is a template
    const isTemplate = activeId.startsWith('template-')
    const templateId = isTemplate ? activeId.replace('template-', '') : null
    const currentTemplate = isTemplate ? templates.find(t => t.id === templateId) : null
    
    const currentFile = !isTemplate ? files.find(f => f.id === activeId) : null
    const fileName = currentFile?.name || currentTemplate?.name
    const fileData = currentFile?.data
    const fileTemplateId = currentFile?.templateId

    // Function to apply translations for Binder Template
    const applyTranslation = (label: string, templateId?: string | null, templateName?: string | null): string => {
        // Check if this is the Binder Template by name or ID
        const isBinder = templateName === 'Binder Template' || 
                        (currentTemplate?.name === 'Binder Template' && templateId === currentTemplate?.id);
        
        if (isBinder && binderTranslations[label as keyof typeof binderTranslations]) {
            return binderTranslations[label as keyof typeof binderTranslations];
        }
        return label;
    }

    const tableColumns: Column[] = useMemo(() => {
        if (isTemplate && currentTemplate) {
            // For templates, create columns from all sections
            const columns: Column[] = []
            let index = 0
            
            // Add formulation columns
            currentTemplate.Formulation?.forEach(param => {
                columns.push({
                    type: ColumnEnum.Data,
                    label: applyTranslation(param.label, currentTemplate.id, currentTemplate.name),
                    index: index++,
                    params: {
                        templateId: currentTemplate.id,
                        featureKey: param.featureKey
                    }
                })
            })
            
            // Add process columns
            currentTemplate.Process?.forEach(param => {
                columns.push({
                    type: ColumnEnum.Data,
                    label: applyTranslation(param.label, currentTemplate.id, currentTemplate.name),
                    index: index++,
                    params: {
                        templateId: currentTemplate.id,
                        featureKey: param.featureKey
                    }
                })
            })
            
            // Add output columns
            currentTemplate.Output?.forEach(param => {
                columns.push({
                    type: ColumnEnum.Data,
                    label: applyTranslation(param.label, currentTemplate.id, currentTemplate.name),
                    index: index++,
                    params: {
                        templateId: currentTemplate.id,
                        featureKey: param.featureKey
                    }
                })
            })
            
            return columns
        }
        
        if (!fileData?.headers) return [];
        return fileData.headers.map((col, i) => ({
            type: ColumnEnum.Data,
            label: applyTranslation(col, fileTemplateId, templates.find(t => t.id === fileTemplateId)?.name),
            index: i,
            params: {
                templateId: fileTemplateId || "",
                featureKey: col
            }   
        }));
    }, [isTemplate, currentTemplate, fileData, fileTemplateId])

    const tableRows: Record<string, any>[] = useMemo(() => {
        if (isTemplate && currentTemplate) {
            // For templates, create a single row showing parameter definitions
            const row: Record<string, any> = {}
            
            // Add formulation data
            currentTemplate.Formulation?.forEach(param => {
                if (param.type === 'num') {
                    row[param.label] = `${param.min} - ${param.max}`
                }
            })
            
            // Add process data
            currentTemplate.Process?.forEach(param => {
                if (param.type === 'num') {
                    row[param.label] = `${param.min} - ${param.max}`
                } else if (param.type === 'cat') {
                    row[param.label] = (param as CategoricalFeature).options?.join(', ') || ''
                }
            })
            
            // Add output data
            currentTemplate.Output?.forEach(param => {
                if (param.type === 'num') {
                    row[param.label] = `${param.min} - ${param.max}`
                } else if (param.type === 'cat') {
                    row[param.label] = (param as CategoricalFeature).options?.join(', ') || ''
                }
            })
            
            return [row]
        }
        
        if (!fileData?.headers || !fileData?.rows) return [];
    
        return fileData.rows.map(row =>
            fileData.headers.reduce((acc, header, index) => {
                acc[header] = row[index];
                return acc;
            }, {} as Record<string, any>)
        );
    }, [isTemplate, currentTemplate, fileData]);

    useEffect(() => {
        if (activeId && !isTemplate) {
            dispatch(getFileData(activeId));
        }
    }, [activeId, dispatch, isTemplate]);


    const downloadCsvFile = () => {
        if (isTemplate) {
            toast.error("Templates cannot be downloaded as CSV files.");
            return;
        }
        if (fileData && fileName) {
            downloadCSV(fileData, fileName);
        } else {
            toast.error("Unable to download file.")
        }
    };

    return (
        <div className={`grow bg-white dark:bg-gray-900 flex flex-col md:translate-x-0 transition-transform duration-300 ease-in-out ${flyoutOpen ? 'translate-x-1/3' : 'translate-x-0'} overflow-hidden`}>
            <Container>
                <div className="flex-1 md:ml-8 xl:mx-4 2xl:mx-8">
                <div className="md:py-8">
                <div className="space-y-10">
                    <div className="">
                        {(isFileDataLoading && !isTemplate) || !fileName ? (
                            <SkeletonTitle />
                        ) : (
                            <Title text={fileName || "..."} actions={isTemplate ? [] : [{type: ActionEnum.DOWNLOAD, label: 'Download', handler: downloadCsvFile}]} />
                        )}
                    </div>

                    {(isFileDataLoading && !isTemplate) || (!isTemplate && !fileData) || (isTemplate && !currentTemplate) ? (
                        <SkeletonTable />
                    ) : (
                        <Table rows={tableRows} columns={tableColumns}/>
                    )}

                </div>
                </div>
                </div>
            </Container>
        </div>
    )
}
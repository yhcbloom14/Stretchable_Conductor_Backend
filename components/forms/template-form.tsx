"use client"

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { refreshTemplates, selectTemplates, selectTemplateLoading } from "@/lib/store/slices/templateSlice"
import { useEffect } from "react"
import Header from "../common/header"
import FormulationInput, { TitleConfig } from "../common/inputs/formulation/formulation-input"
import ProcessInput from "../common/inputs/process/process-input"
import { SkeletonInput } from "../common/skeleton"

type TemplateFormProps = {
    isSelectable?: boolean
    formulationInputTitle?: string
    formulationInputTitleConfig?: TitleConfig
    processInputTitle?: string
    processInputSubTitle?: string
    removeCompositionIndicator?: boolean
}
export default function TemplateForm({ isSelectable = true, formulationInputTitle = "", formulationInputTitleConfig = {}, processInputTitle = "", processInputSubTitle = "", removeCompositionIndicator = false }: TemplateFormProps) {
    const dispatch = useAppDispatch()
    const templates = useAppSelector(selectTemplates)
    const isLoading = useAppSelector(selectTemplateLoading)

    useEffect(() => {
        // Only fetch templates if we don't have any cached
        if (templates.length === 0) {
            dispatch(refreshTemplates(false))
        }
    }, [dispatch, templates.length])

    // Show skeleton loading for initial page load
    if (isLoading && templates.length === 0) {
        return (
            <div className="space-y-6 mt-8">
                <Header text="Formulation" />
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonInput key={i} />
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <SkeletonInput key={i} />
                            ))}
                        </div>
                        <SkeletonInput />
                    </div>
                </div>
                <Header text="Process" />
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonInput key={i} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    
    return (
        <div className="space-y-6 mt-8">
                <Header text={formulationInputTitle || "Formulation"} />
                <FormulationInput titleConfig={formulationInputTitleConfig} isSelectable={isSelectable} removeCompositionIndicator={removeCompositionIndicator} />
                <Header text={processInputTitle || "Process"} />
                <ProcessInput title={processInputSubTitle} isSelectable={isSelectable} />
        </div>
    )
}
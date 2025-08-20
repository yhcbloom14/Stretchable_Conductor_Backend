"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import toast from "react-hot-toast"
import { Loader2 } from "lucide-react"
import Title from "@/components/common/title"
import TemplateForm from "@/components/forms/template-form"
import { selectProcess, selectOutputs, selectActiveTemplate, selectMaterials, selectTemplateLoading, templateSlice } from "@/lib/store/slices/templateSlice"
import { ActionEnum } from "@/lib/types/Action"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import Button from "@/components/common/button"
import { SkeletonCard } from "@/components/common/skeleton"
import { Column, ColumnEnum } from "@/lib/types/Column"
import { fetchResults } from "@/lib/data/fetch-results"
import { OutputView } from "@/lib/types/Output"
import { fetchPredictions } from "@/lib/data/fetch-predictions"
import { Alert } from '@/components/ui/alert';
import { DataTable } from '@/components/ui/data-table';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import type { ColumnDef } from '@tanstack/react-table';

export default function DirectPredictionPage() {
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = useState(false)
    const activeTemplate = useAppSelector(selectActiveTemplate)
    const materials = useAppSelector(selectMaterials)
    const process = useAppSelector(selectProcess)
    const outputs = useAppSelector(selectOutputs)

    const isTemplateLoading = useAppSelector(selectTemplateLoading)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [tableRows, setTableRows] = useState<Record<string, any>[]>([])
    const [tableColumns, setTableColumns] = useState<ColumnDef<any>[]>([])
    const expandColumns = useRef<ColumnDef<any>[]>([])
    const expandDataSource = useRef<Record<string, any>[]>([])

    const columns: Column[] = useMemo(() => {
        if (!outputs) return [];
        return outputs.map((output, i) => ({
            type: ColumnEnum.Data,
            label: output.label,
            index: i,
            params: {
                templateId: activeTemplate?.id || "",
                featureKey: output.featureKey
            }   
        }));
    }, [outputs, activeTemplate?.id])

    // This code was referencing undefined 'results' variable - commenting out for now
    // const rows = useMemo(() => {
    //     if (!results.length) return [];
    //     return results.map(result => {
    //         const row: Record<string, any> = {};
    //         outputs?.forEach(output => {
    //             row[output.label] = result[output.featureKey];
    //         });
    //         return row;
    //     });
    // }, [results, outputs]);
                      
    // const fetchLatestResults = async () => {
    //     if (activeTemplate?.id) {
    //         const latestResults = await fetchResults(activeTemplate.id, OutputView.DIRECT)
    //         if (latestResults && latestResults.length > 0) {
    //             const parsedOutputs = latestResults.map(result => JSON.parse(result.outputs))
    //             setResults(parsedOutputs)
    //         }
    //     }
    // }
    // fetchLatestResults()
    // }, [activeTemplate?.id])

    const handleTemplateChange = (value: string) => {
        dispatch(templateSlice.actions.setActiveId(value))
    }

    const handleDelete = (id: string) => {
        const newData = tableRows.filter((item) => item.id !== id);
        setTableRows(newData);
    }
    const generateTableData = (data: any) => {
        const results = data?.predictions || []
        let columns = [] as ColumnDef<any>[]
        const rows = [] as Record<string, any>[]
        results.forEach((result: any) => {
            const predictions = result?.predictions || {}
            const { materials = {}, parameters = {} } = result?.inputs || {}
            const inputs = {
                ...materials,
                ...parameters
            }
            if (columns.length === 0) {
                columns = Object.keys(predictions).map((key: string) => ({
                    header: key === '_uncertainty' ? 'Model Uncertainty' : key,
                    accessorKey: key,
                    cell: ({ getValue, row }) => {
                        const value = getValue() as any
                        return <span key={row.id}>{isNaN(value) ? value : Number(value).toFixed(2)}</span>
                    }
                }))
            }
            if (expandColumns.current.length === 0) {
                expandColumns.current = Object.keys(inputs).map((key: string, index: number) => ({
                    header: key,
                    accessorKey: key,
                    id: `expand_${expandColumns.current.length + index}`,
                }))
            }
            const rowId = `row_${tableRows.length + 1}`
            if (Object.keys(inputs).length > 0) {
                expandDataSource.current.push({
                    ...inputs,
                    id: rowId
                })
            }
            if (Object.keys(predictions).length > 0) {
                rows.push({
                    ...predictions,
                    id: rowId
                })
            }
        })
        setTableColumns(prev => {
            return prev.concat(columns)
        })
        setTableRows(prev => {
            return prev.concat(rows)
        })
    }

    const validateForm = (formData: FormData) => {
        //#1. Check formulation is === 100
        //#2. Check process are within bounds
        return []
    }

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.target as HTMLFormElement)
        
        const formErrors = validateForm(formData)
        if (formErrors.length > 0) {
            setIsLoading(false)
            return
        }

        const payload = {
            inputs: [{
                materials: {},
                parameters: {}
            }] as any[],
        }
        const inputs = Object.fromEntries(formData) as Record<string, string | number>
        // Set all formulation inputs not in inputs to 0 and cast values based on feature type
        materials.forEach(material => {
            if (!(material.featureKey in inputs)) {
                payload.inputs[0].materials[material.featureKey] = 0
            } else {
                payload.inputs[0].materials[material.featureKey] = Number(inputs[material.featureKey])
            }
        })

        // Handle process parameters
        process.forEach(param => {
            if (!(param.featureKey in inputs)) {
                payload.inputs[0].parameters[param.featureKey] = param.type === 'num' ? param.min : param.options[0]
            } else {
                // Cast input values based on feature type
                if (param.type === 'num') {
                    payload.inputs[0].parameters[param.featureKey] = Number(inputs[param.featureKey])
                } else if (param.type === 'cat') {
                    payload.inputs[0].parameters[param.featureKey] = String(inputs[param.featureKey])
                }
            }
        })

        if (activeTemplate?.id) {
            fetchPredictions(payload)
                // TODO: fix data type
                .then((data: any) => {
                    console.log('Fetched prediction:', data)
                    generateTableData(data)
                    setIsLoading(false)
                    if (errorMsg) {
                        setErrorMsg('')
                    }
                }).catch((error: Error) => {
                    setIsLoading(false)
                    setErrorMsg(error?.message || "An error occurred while fetching predictions.")
                })
            // Fetch the latest results after prediction
            // const latestResults = await fetchResults(activeTemplate.id, OutputView.DIRECT)
            // if (latestResults && latestResults.length > 0) {
            //     const parsedOutputs = latestResults.map(result => JSON.parse(result.outputs))
            //     setResults(parsedOutputs)
            // }
        } else {
            toast.error("No template selected.")
        }
    }
    const isTableDataAvailable = tableRows.length > 0 && tableColumns.length > 0
    
    const expandedRowRender = (record: any) => {
        const expandData = expandDataSource.current.find(data => data.id === record.id) || {}
        return (
            <DataTable
                columns={expandColumns.current.map(column => ({
                    ...column,
                    cell: ({ getValue }) => {
                        const value = getValue() as any
                        return <span>{isNaN(value) ? value : Number(value).toFixed(2)}</span>
                    }
                }))}
                data={[expandData]}
                pageSize={1}
                searchColumn={undefined} // Disable search for single-row expanded view
            />
        )
    }
    return (
        <>
            <Title text="Single-Point Property Prediction" actions={[{type: ActionEnum.SELECT_TEMPLATE, label: 'Select Template File', handler: handleTemplateChange}]}/>
            <form onSubmit={onSubmit} className="space-y-6">
                {isTemplateLoading ? (
                    <SkeletonCard />
                ) : (
                    <TemplateForm
                      formulationInputTitle="Section I – Formulation Parameter Inputs"
                      processInputTitle="Section II – Process Parameter Inputs"
                      processInputSubTitle="Processing Parameters"
                      formulationInputTitleConfig={{
                          compositionInputTitle: "Formulation Parameters",
                      }} isSelectable={false} />
                )}
                <Button
                    type="submit"
                    variant="gradient"
                    disabled={isLoading || isTemplateLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Predicting...
                        </>
                    ) : (   
                        "Predict"
                    )}
                </Button>
                {errorMsg && (
                    <Alert variant="destructive" showIcon>
                        {errorMsg}
                    </Alert>
                )}
            </form>
            {isTableDataAvailable && (
                <DataTable
                    columns={tableColumns}
                    data={tableRows}
                    bordered
                    size="small"
                    searchColumn={tableColumns[0]?.accessorKey || "id"}
                    searchPlaceholder="Search predictions..."
                    expandable={{ 
                        expandedRowRender, 
                        defaultExpandedRowKeys: ['0'] 
                    }}
                    actions={{
                        render: (record: any, index: number) => {
                            const searchParams = new URLSearchParams(expandDataSource.current[index])
                            searchParams.delete('id') // remove id from search params
                            const searchParamsString = searchParams.toString()
                            return (
                                <div className="flex flex-col gap-y-1">
                                    <ConfirmationDialog
                                        title="Sure to delete?"
                                        description="This action cannot be undone."
                                        onConfirm={() => handleDelete(record.id)}
                                        variant="destructive"
                                    >
                                        <button className="text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 cursor-pointer underline hover:no-underline transition-colors text-left">
                                            Delete
                                        </button>
                                    </ConfirmationDialog>
                                    {/* <a href={`/materials/heatmap?${searchParamsString}`} className="text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 cursor-pointer underline hover:no-underline transition-colors">
                                        Copy inputs to Heatmap
                                    </a> */}
                                </div>
                            )
                        }
                    }}
                />
            )}
        </>
    )
}
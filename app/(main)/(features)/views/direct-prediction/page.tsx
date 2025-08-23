"use client";

import { useState, useMemo, useRef } from "react"
import toast from "react-hot-toast"
import { Loader2 } from "lucide-react"
import Title from "@/components/common/title"
import TemplateForm from "@/components/forms/template-form"
import { selectProcess, selectOutputs, selectActiveTemplate, selectMaterials, selectTemplateLoading, templateSlice, selectActiveId } from "@/lib/store/slices/templateSlice"
import { ActionEnum } from "@/lib/types/Action"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import Button from "@/components/common/button"
import { SkeletonCard } from "@/components/common/skeleton"
import { Column, ColumnEnum } from "@/lib/types/Column"
import { fetchPredictions } from "@/lib/data/fetch-predictions"
import { Alert, Table, Popconfirm } from 'antd';
import type { TableColumnsType } from 'antd';
import { PROPERTY_TEMPLATE_ID } from "@/lib/constants"

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
    const [tableColumns, setTableColumns] = useState<TableColumnsType>([])
    const expandColumns = useRef<TableColumnsType<any>>([])
    const expandDataSource = useRef<Record<string, any>[]>([])
    const activeTemplateId = useAppSelector(selectActiveId)

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

    const handleDelete = (key: React.Key) => {
        const newData = tableRows.filter((item) => item.key !== key);
        setTableRows(newData);
    }
    const generateTableData = (data: any, inputData?: any) => {
        const results = data?.predictions || [];

        // Record the current number of rows to assign unique incremental keys
        const startIndex = tableRows.length;

        // If table columns have not been set yet, use the first prediction to define them
        if (tableColumns.length === 0 && results.length > 0) {
            const first = results[0];
            const firstPreds = first?.predictions || {};
            const cols: TableColumnsType = Object.keys(firstPreds).map((key: string) => {
                console.log("Current key:", key);   
                return {
                    title: key === '_uncertainty' ? 'Model Uncertainty' : key,
                    dataIndex: key,
                    render: (text, record) => (
                        <span key={record.key}>
                            {text === null || text === undefined
                                ? 'N/A'
                                : typeof text === 'boolean'
                                ? (text ? 'True' : 'False')
                                : typeof text === 'number'
                                    ? (isNaN(text) ? 'N/A' : text.toFixed(2))
                                    : text}
                        </span>
                    ),
                };
                });
            setTableColumns(cols);
        }

        const newRows: Record<string, any>[] = [];
        const newExpandRows: Record<string, any>[] = [];

        results.forEach((result: any, i: number) => {
            const predictions = result?.predictions || {};
            // Use the input data passed from onSubmit, or fall back to result?.inputs
            const { materials = {}, parameters = {} } = inputData || result?.inputs || {};
            const inputs = { ...materials, ...parameters };

            const rowKey = startIndex + i; // Ensure each row has a unique key

            // Only initialize expandable row columns once, if not already set
            if (expandColumns.current.length === 0 && Object.keys(inputs).length > 0) {
            expandColumns.current = Object.keys(inputs).map((k, idx) => ({
                title: k,
                dataIndex: k,
                key: idx,
            }));
            }

            if (Object.keys(inputs).length > 0) {
            newExpandRows.push({ ...inputs, key: rowKey });
            }
            if (Object.keys(predictions).length > 0) {
            newRows.push({ ...predictions, key: rowKey });
            }
        });

        // Append new rows to the table without modifying existing columns
        expandDataSource.current = expandDataSource.current.concat(newExpandRows);
        setTableRows(prev => prev.concat(newRows));
        };

    // const generateTableData = (data: any) => {
    //     console.log("response data:", data)
    //     const results = data?.predictions || []
    //     let columns = [] as TableColumnsType
    //     const rows = [] as Record<string, any>[]
    //     results.forEach((result: any) => {
    //         const predictions = result?.predictions || {}
    //         const { materials = {}, parameters = {} } = result?.inputs || {}
    //         const inputs = {
    //             ...materials,
    //             ...parameters
    //         }
    //         if (columns.length === 0) {
    //             columns = Object.keys(predictions).map((key: string) => ({
    //                 title: key === '_uncertainty' ? 'Model Uncertainty' : key,
    //                 dataIndex: key,
    //                 render: (text, record) => (
    //                     <span key={record.key}>
    //                         {typeof text === 'boolean' ? (text ? 'True' : 'False') : isNaN(text) || text === null ? 'N/A' : text.toFixed(2)}
    //                     </span>
    //                 )
    //             }))
    //         }
    //         if (expandColumns.current.length === 0) {
    //             expandColumns.current = Object.keys(inputs).map((key: string, index: number) => ({
    //                 title: key,
    //                 dataIndex: key,
    //                 key: expandColumns.current.length + index,
    //             }))
    //         }
    //         if (Object.keys(inputs).length > 0) {
    //             expandDataSource.current.push({
    //                 ...inputs,
    //                 key: tableRows.length + 1
    //             })
    //         }
    //         if (Object.keys(predictions).length > 0) {
    //             rows.push({
    //                 ...predictions,
    //                 key: tableRows.length + 1
    //             })
    //         }
    //     })
    //     setTableColumns(prev => {
    //         return prev.concat(columns)
    //     })
    //     setTableRows(prev => {
    //         return prev.concat(rows)
    //     })
    // }

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
            fetchPredictions(payload, activeTemplate.id)
                // TODO: fix data type
                .then((data: any) => {
                    console.log('Fetched prediction:', data)
                    generateTableData(data, payload.inputs[0])
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
        const inputData = expandDataSource.current.find(data => data.key === record.key) || {};
        
        // Define the detailed view columns with proper labels
        const detailColumns = [
            {
                title: 'Parameter',
                dataIndex: 'parameter',
                key: 'parameter',
                width: '40%',
                render: (text: string) => <span className="font-medium">{text}</span>
            },
            {
                title: 'Value',
                dataIndex: 'value',
                key: 'value',
                width: '60%',
                render: (val: any) => {
                    if (val === null || val === undefined) return <span className="text-gray-400">N/A</span>;
                    if (typeof val === 'number') {
                        return <span>{isNaN(val) ? 'N/A' : val.toFixed(2)}</span>;
                    }
                    return <span>{val}</span>;
                }
            }
        ];

        // Map the input data to the detailed view format
        const detailData = [
            { key: 'mxene', parameter: 'MXene (wt.%)', value: inputData['MXene (wt.%)'] },
            { key: 'swnt', parameter: 'SWNT (wt.%)', value: inputData['SWNT (wt.%)'] },
            { key: 'aunp', parameter: 'AuNP (wt.%)', value: inputData['AuNP (wt.%)'] },
            { key: 'pva', parameter: 'PVA (wt.%)', value: inputData['PVA (wt.%)'] },
            { key: 'deformation', parameter: 'Deformation Sequence', value: inputData['Deformation Sequence'] },
            { key: 'prestrain', parameter: 'Pre-strain (%)', value: inputData['Applied Pre-Strain (%)'] },
            { key: 'thickness', parameter: 'Thickness (nm)', value: inputData['Thickness (nm)'] }
        ].filter(item => item.value !== undefined && item.value !== null);

        return (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="mb-3">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Input Parameters Details
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Detailed view of the input parameters used for this prediction
                    </p>
                </div>
                {Object.keys(inputData).length > 0 ? (
                    <Table
                        columns={detailColumns}
                        dataSource={detailData}
                        pagination={false}
                        size="small"
                        className="detail-table"
                    />
                ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        <p>No input data available for this prediction</p>
                        <p className="text-xs mt-1">This may occur if the backend service is not running</p>
                    </div>
                )}
            </div>
        );
    }
    const tableColumnsWithActions = [
        ...tableColumns,
        {
            title: 'Actions',
            dataIndex: 'action',
            render: (_: any, record: any, index: number) => {
                const searchParams = new URLSearchParams(expandDataSource.current[index])
                searchParams.delete('key') // remove key from search params
                const searchParamsString = searchParams.toString()
                return (
                    <div className="flex flex-col gap-y-1">
                        <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)} placement="topLeft">
                            <a className="text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 cursor-pointer underline hover:no-underline transition-colors">Delete</a>
                        </Popconfirm>
                        {/* <a href={`/views/heatmap?${searchParamsString}`} className="text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 cursor-pointer underline hover:no-underline transition-colors">Copy inputs to Heatmap</a> */}
                    </div>
            )}
        },
    ]
    return (
        <>
            <Title text="Forward Prediction" actions={[{type: ActionEnum.SELECT_TEMPLATE, label: 'Select Template File', handler: handleTemplateChange}]}/>
            <form onSubmit={onSubmit} className="space-y-6">
                {isTemplateLoading ? (
                    <SkeletonCard />
                ) : (
                    <TemplateForm
                      formulationInputTitle="Section I – Composition Parameter Inputs"
                      processInputTitle="Section II – Other Inputs"
                      processInputSubTitle=" "
                      formulationInputTitleConfig={{
                    //compositionInputTitle: "Composition Parameters",
                    compositionInputTitle: " ",
                      }} isSelectable={false} />
                )}
                <Button
                    type="submit"
                    variant="gradient"
                    disabled={isLoading || isTemplateLoading || activeTemplateId !== PROPERTY_TEMPLATE_ID}
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
                {errorMsg && <Alert className="w-fit" message={errorMsg} type="error" showIcon />}
            </form>
            {isTableDataAvailable && (
                <>
                    <style jsx>{`
                        .detail-table .ant-table-thead > tr > th {
                            background-color: #f8fafc;
                            border-bottom: 1px solid #e2e8f0;
                            font-weight: 600;
                            color: #475569;
                        }
                        .detail-table .ant-table-tbody > tr > td {
                            border-bottom: 1px solid #f1f5f9;
                        }
                        .detail-table .ant-table-tbody > tr:hover > td {
                            background-color: #f1f5f9;
                        }
                        .dark .detail-table .ant-table-thead > tr > th {
                            background-color: #1e293b;
                            border-bottom: 1px solid #334155;
                            color: #cbd5e1;
                        }
                        .dark .detail-table .ant-table-tbody > tr > td {
                            border-bottom: 1px solid #334155;
                        }
                        .dark .detail-table .ant-table-tbody > tr:hover > td {
                            background-color: #334155;
                        }
                        
                        /* Make expand icon more prominent */
                        .ant-table-expand-icon-col .ant-table-row-expand-icon {
                            background-color: #3b82f6;
                            border-color: #3b82f6;
                            color: white;
                            border-radius: 4px;
                            width: 20px;
                            height: 20px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 12px;
                        }
                        .ant-table-expand-icon-col .ant-table-row-expand-icon:hover {
                            background-color: #2563eb;
                            border-color: #2563eb;
                        }
                        .dark .ant-table-expand-icon-col .ant-table-row-expand-icon {
                            background-color: #60a5fa;
                            border-color: #60a5fa;
                        }
                        .dark .ant-table-expand-icon-col .ant-table-row-expand-icon:hover {
                            background-color: #3b82f6;
                            border-color: #3b82f6;
                        }
                    `}</style>
                    <Table
                        bordered
                        columns={tableColumnsWithActions}
                        expandable={{ expandedRowRender, defaultExpandedRowKeys: ['0'] }}
                        dataSource={tableRows}
                        pagination={false}
                        size="small"
                    />
                </>
            )}
        </>
    )
}
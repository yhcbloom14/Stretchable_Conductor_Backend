"use client"

import { useEffect, useState, useRef, useMemo, useCallback } from "react"
import { Loader2 } from "lucide-react"
import { PlotData } from 'plotly.js'
import type { TableColumnsType } from 'antd';
import { Popconfirm, Table } from 'antd';
import Title from "@/components/common/title"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { refreshTemplates, templateSlice, selectTemplates } from "@/lib/store/slices/templateSlice"
import { ActionEnum } from "@/lib/types/Action"
import { selectMaterials, selectProcess, selectOutputs, selectTemplateLoading } from "@/lib/store/slices/templateSlice"
import DropdownInput from "@/components/common/dropdown-input"
import NumericInputSelector from "@/components/inverse-design/numeric-input-selector"
import CategoricalInputSelector from "@/components/inverse-design/categorical-input-selector"
import { fetchCluster } from "@/lib/data/fetch-cluster"
import Button from "@/components/common/button"
import HeatmapLazy from "@/components/heatmap-lazy"
import { downloadCSV } from "@/components/utils/parse-csv"
import CollapsibleWrapper from "@/components/common/collapsible-wrapper"
import { SkeletonList, SkeletonChart } from "@/components/common/skeleton"

const materialOptions = [
    { id: 'optional', label: 'Optional', value: 'optional' },
    { id: 'required', label: 'Required', value: 'required' },
    { id: 'excluded', label: 'Excluded', value: 'excluded' }
]
const uncertaintyCutoffOptions = [
    { id: '15', label: '15%', value: 15 },
    { id: '30', label: '30%', value: 30 },
    { id: '45', label: '45%', value: 45 },
    { id: '60', label: '60%', value: 60 }
]
export default function InverseDesignPage() {
    // TODO: replace state type 
    const [requiredMaterials, setRequiredMaterials] = useState<string[]>([])
    const [excludedMaterials, setExcludedMaterials] = useState<string[]>([])
    const [materialRanges, setMaterialRanges] = useState<Record<string, Record<string, number>>>({})
    const [processParams, setProcessParams] = useState<Record<string, Record<string, number | string[]>>>({})
    const [outputParams, setOutputParams] = useState<Record<string, Record<string, number | string[]>>>({})
    const [outputDisplayOptions, setOutputDisplayOptions] = useState<Record<string, string>[]>([])
    const [outputDisplay, setOutputDisplay] = useState<string[]>([])
    const [uncertaintyCutoff, setUncertaintyCutoff] = useState<number>(30)
    const [tableRows, setTableRows] = useState<Record<string, any>[]>([])
    const [tableColumns, setTableColumns] = useState<TableColumnsType>([])
    const expandColumns = useRef<TableColumnsType<any>>([])
    const expandDataSource = useRef<Record<string, any>[]>([])

    const [plotData, setPlotData] = useState<Partial<PlotData>>({
        marker: {
            size: 10
        },
        type: 'scatter'
    })

    const dispatch = useAppDispatch()
    const templates = useAppSelector(selectTemplates)
    const materials = useAppSelector(selectMaterials)
    const parameters = useAppSelector(selectProcess)
    const outputs = useAppSelector(selectOutputs)
    const isLoading = useAppSelector(selectTemplateLoading)

    const handleTemplateChange = (value: string) => {
        dispatch(templateSlice.actions.setActiveId(value))
    }

    useEffect(() => {
        // Only fetch templates if we don't have any cached
        if (templates.length === 0) {
            dispatch(refreshTemplates(false))
        }
    }, [dispatch, templates.length])

    // Memoized computations to prevent UI blocking
    const memoizedMaterialRanges = useMemo(() => {
        return materials.reduce((acc: Record<string, { min: number; max: number }>, material) => {
            acc[material.featureKey] = {
                min: material.min,
                max: material.max
            }
            return acc
        }, {})
    }, [materials])

    const memoizedProcessParams = useMemo(() => {
        return parameters.reduce((acc: Record<string, Record<string, number | string[]>>, process) => {
            if (process.type === 'cat') {
                acc[process.featureKey] = {
                    choices: process.options
                }
            } else if (process.type === 'num') {
                acc[process.featureKey] = {
                    min: process.min,
                    max: process.max
                }
            }
            return acc
        }, {})
    }, [parameters])

    const memoizedOutputParams = useMemo(() => {
        return outputs.reduce((acc: Record<string, Record<string, number | string[]>>, output) => {
            if (output.type === 'cat') {
                acc[output.featureKey] = {
                    choices: output.options
                }
            } else if (output.type === 'num') {
                acc[output.featureKey] = {
                    min: output.min,
                    max: output.max
                }
            }
            return acc
        }, {})
    }, [outputs])

    const memoizedOutputDisplayOptions = useMemo(() => {
        return outputs.map(output => ({
            id: output.featureKey,
            label: output.label,
            value: output.featureKey
        }))
    }, [outputs])

    const memoizedOutputDisplay = useMemo(() => {
        return [outputs[0]?.featureKey || '', outputs[1]?.featureKey || '']
    }, [outputs])

    // Update state only when memoized values change
    useEffect(() => {
        setMaterialRanges(memoizedMaterialRanges)
    }, [memoizedMaterialRanges])

    useEffect(() => {
        setProcessParams(memoizedProcessParams)
    }, [memoizedProcessParams])

    useEffect(() => {
        setOutputParams(memoizedOutputParams)
    }, [memoizedOutputParams])

    useEffect(() => {
        setOutputDisplayOptions(memoizedOutputDisplayOptions)
    }, [memoizedOutputDisplayOptions])

    useEffect(() => {
        setOutputDisplay(memoizedOutputDisplay)
    }, [memoizedOutputDisplay])

    // Memoized plot data generation to prevent blocking operations
    const generatePlotData = useCallback((data: any) => {
        const samples = data?.samples || []
        const xValues = [] as (number | string)[]
        const yValues = [] as (number | string)[]
        samples.forEach((sample: any) => {
            if (sample[outputDisplay[0]] && sample[outputDisplay[1]]) {
                xValues.push(sample[outputDisplay[0]])
                yValues.push(sample[outputDisplay[1]])
            }
        })
        setPlotData(prev => ({
            ...prev,
            x: xValues,
            y: yValues
        }))
    }, [outputDisplay])

    const handleDelete = (key: React.Key) => {
        const newData = tableRows.filter((item) => item.key !== key);
        setTableRows(newData);
    }
    const generateTableData = useCallback((data: any) => {
        const clusters = data?.clusters || []
        let columns = [] as TableColumnsType
        const rows = [] as Record<string, any>[]
        clusters.forEach((cluster: any, i: number) => {
            const predictions = cluster?.predictions || {}
            const { materials = {}, parameters = {} } = cluster?.inputs || {}
            const inputs = {
                ...materials,
                ...parameters
            }
            if (columns.length === 0) {
                columns = Object.keys(predictions).map((key: string) => ({
                    title: key === '_uncertainty' ? 'Model Uncertainty' : key,
                    dataIndex: key,
                    render: (text, record) => <span key={record.key}>{isNaN(text) ? text : text.toFixed(2) }</span>
                }))
            }
            if (expandColumns.current.length === 0) {
                expandColumns.current = Object.keys(inputs).map((key: string) => ({
                    title: key,
                    dataIndex: key,
                    key
                }))
            }
            if (Object.keys(inputs).length > 0) {
                expandDataSource.current.push({
                    ...inputs,
                    key: i
                })
            }
            if (Object.keys(predictions).length > 0) {
                rows.push({
                    ...predictions,
                    key: i
                })
            }
        })
        setTableColumns(columns)
        setTableRows(rows)
    }, [])

    const onFetchSample = () => {
        const normalizedMaterialRanges = Object.entries(materialRanges).reduce((acc, [key, value]) => {
            // Only include required and optional materials
            if (!excludedMaterials.includes(key)) {
                (acc.ranges as { [key: string]: any })[key] = value
            }
            return acc
        }, {
            required_materials: requiredMaterials,
            excluded_materials: excludedMaterials,
            ranges: {}
        } as Record<string, string[] | { [key: string]: any }>)
        const normalizedParamTarget = Object.entries({...processParams, ...outputParams}).reduce((acc, [key, value]) => {
            // skip uncertainty for now as it is not a valid output parameter
            if (key === 'Uncertainty') {
                return acc
            }
            if (outputDisplay.includes(key)) {
                acc.target[key] = value
                return acc
            }
            acc.parameter[key] = value
            return acc
        }, {
            parameter: {},
            target: {}
        } as Record<string, any>)
        const payload = {
            filters: {
                material: normalizedMaterialRanges,
                parameter: normalizedParamTarget.parameter,
                target: normalizedParamTarget.target,
                uncertainty_cutoff: uncertaintyCutoff
            },
            prediction_targets: outputDisplay
        }
        fetchCluster(payload)
            .then((data) => {
                console.log('Fetched sample:', data)
                generatePlotData(data)
                generateTableData(data)
            }).catch((error) => {
                console.error('Error fetching sample:', error)
            })
    }
    const onExportSample = () => {
        const csvData = {
            headers: [...expandColumns.current, ...tableColumns].map(col => `${col.title}` || ''),
            rows: [...expandDataSource.current, ...tableRows].map(row => {
                const val = Object.values(row)
                val.pop() // remove the key field
                return val
            })
        }
        downloadCSV(csvData, 'inverse_design_sample.csv')
    }
    const isDisabled = !materials.length && !parameters.length && !outputs.length
    const isTableDataAvailable = tableRows.length > 0 && tableColumns.length > 0
    const expandedRowRender = (record: any) => (
        <Table
            columns={expandColumns.current.map(column => ({
                ...column,
                render: (val) => <span key={column.key}>{isNaN(val) ? val : val.toFixed(2) }</span>
            }))}
            dataSource={[expandDataSource.current.find(data => data.key === record.key) || {}]}
            pagination={false}
        />
    )
    const columns = [
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
                        <a href={`/views/direct-prediction?${searchParamsString}`} className="text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 cursor-pointer underline hover:no-underline transition-colors">Copy inputs to Prediction</a>
                        {/* <a href={`/views/heatmap?${searchParamsString}`} className="text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 cursor-pointer underline hover:no-underline transition-colors">Copy inputs to Heatmap</a> */}
                    </div>
            )}
        },
    ]
    const hasTemplateData = materials.length > 0 || parameters.length > 0 || outputs.length > 0
    return (
        <>
            <Title text="Inverse Design Engine" actions={[{type: ActionEnum.SELECT_TEMPLATE, label: 'Select Template File', handler: handleTemplateChange}]}/>
            {/* <CollapsibleWrapper title="Section I – Define Formulation Parameter Ranges">
            {
                isLoading ? (
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
                        <SkeletonList count={5} />
                    </div>
                ) : materials.length > 0 ? (
                    <ul className="flex flex-col gap-y-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
                        {
                            materials.map((material, index) => {
                                const { min, max, label, featureKey } = material
                                const selectedOption = requiredMaterials.includes(featureKey) ? 'required' : excludedMaterials.includes(featureKey) ? 'excluded' : 'optional'
                                return (
                                    <li className="flex items-center gap-x-4 [&:not(:last-child)]:border-b-2 [&:not(:last-child)]:pb-6 border-gray-100" key={featureKey}>
                                        <DropdownInput className="[&>button]:min-w-0 w-auto" options={materialOptions} selected={selectedOption} handleSelect={(selected) => {
                                            if (selected === 'required') {
                                                setRequiredMaterials(prev => {
                                                    if (!prev.includes(featureKey)) {
                                                        return [...prev, featureKey]
                                                    }
                                                    return prev
                                                })
                                                setExcludedMaterials(prev => {
                                                    if (prev.includes(featureKey)) {
                                                        return prev.filter(item => item !== featureKey)
                                                    }
                                                    return prev
                                                })
                                            } else if (selected === 'excluded') {
                                                setRequiredMaterials(prev => {
                                                    if (prev.includes(featureKey)) {
                                                        return prev.filter(item => item !== featureKey)
                                                    }
                                                    return prev
                                                })
                                                setExcludedMaterials(prev => {
                                                    if (!prev.includes(featureKey)) {
                                                        return [...prev, featureKey]
                                                    }
                                                    return prev
                                                })
                                            } else {
                                                setRequiredMaterials(prev => {
                                                    if (prev.includes(featureKey)) {
                                                        return prev.filter(item => item !== featureKey)
                                                    }
                                                    return prev
                                                })
                                                setExcludedMaterials(prev => {
                                                    if (prev.includes(featureKey)) {
                                                        return prev.filter(item => item !== featureKey)
                                                    }
                                                    return prev
                                                })
                                            }
                                        }}/>
                                        <NumericInputSelector
                                            label={label}
                                            disabled={selectedOption === 'excluded'}
                                            currMin={materialRanges[featureKey]?.min || min}
                                            currMax={materialRanges[featureKey]?.max || max}
                                            min={min} max={max}
                                            onChange={(newRange) => {
                                                setMaterialRanges(prev => ({
                                                    ...prev,
                                                    [featureKey]: {
                                                        min: newRange[0],
                                                        max: newRange[1]
                                                    }
                                                }))
                                            }}
                                        />
                                    </li>
                                )
                            })
                        }
                    </ul>
                ) : (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        No materials available for inverse design.
                    </div>
                )
            }
            </CollapsibleWrapper>
            <CollapsibleWrapper title="Section II – Define Processing Parameter Ranges">
            {
                isLoading ? (
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
                        <SkeletonList count={3} />
                    </div>
                ) : parameters.length > 0 ? (
                    <ul className="flex flex-col gap-y-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
                        {
                            parameters.map(process => {
                                const { type, label, featureKey } = process
                                if (type === 'cat') {
                                    return (
                                        <li className="flex items-center gap-x-4 [&:not(:last-child)]:border-b-2 [&:not(:last-child)]:pb-6 border-gray-100" key={featureKey}>
                                            <CategoricalInputSelector
                                                label={label}
                                                options={process.options}
                                                onChange={(e) => {
                                                    setProcessParams(prev => {
                                                        const choices = (prev[featureKey]?.choices || []) as string[]
                                                        if (e.target.checked) {
                                                            return {
                                                                ...prev,
                                                                [featureKey]: {
                                                                    choices: [...choices, e.target.value]
                                                                }
                                                            }
                                                        } else {
                                                            // TODO: this will pass empty array if no choices are selected
                                                            // should we remove the key from the object?
                                                            return {
                                                                ...prev,
                                                                [featureKey]: {
                                                                    choices: choices.filter(choice => choice !== e.target.value)
                                                                }
                                                            }
                                                        }
                                                    })
                                                }}
                                            />
                                        </li>
                                    )
                                } else if (type === 'num') {
                                    const { min, max } = process || {}
                                    return (
                                        <li className="flex items-center gap-x-2 [&:not(:last-child)]:border-b-2 [&:not(:last-child)]:pb-6 border-gray-100" key={featureKey}>
                                             <NumericInputSelector
                                                label={label}
                                                currMin={processParams[featureKey]?.min as number || min}
                                                currMax={processParams[featureKey]?.max as number || max}
                                                min={min}
                                                max={max}
                                                onChange={(newRange) => {
                                                    setProcessParams(prev => ({
                                                        ...prev,
                                                        [featureKey]: {
                                                            min: newRange[0],
                                                            max: newRange[1]
                                                        }
                                                    }))
                                                }}
                                            />
                                        </li>
                                    )
                                }
                            })
                        }
                    </ul>
                ) : (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        No process parameters available for inverse design.
                    </div>
                )
            }
            </CollapsibleWrapper> */}
            <CollapsibleWrapper title="Section I – Provide Detailed Product Specifications">
            {
                isLoading ? (
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
                        <SkeletonList count={4} />
                    </div>
                ) : outputs.length > 0 ? (
                    <ul className="flex flex-col gap-y-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
                        {
                            outputs.map((output, index) => {
                                const { type, label, featureKey } = output
                                if (type === 'cat') {
                                    return (
                                        <li className="flex items-center gap-x-4 [&:not(:last-child)]:border-b-2 [&:not(:last-child)]:pb-6 border-gray-100" key={featureKey}>
                                            <CategoricalInputSelector
                                                label={label}
                                                options={output.options}
                                                onChange={(e) => {
                                                    setOutputParams(prev => {
                                                        const choices = (prev[featureKey]?.choices || []) as string[]
                                                        if (e.target.checked) {
                                                            return {
                                                                ...prev,
                                                                [featureKey]: {
                                                                    choices: [...choices, e.target.value]
                                                                }
                                                            }
                                                        } else {
                                                            // TODO: this will pass empty array if no choices are selected
                                                            // should we remove the key from the object?
                                                            return {
                                                                ...prev,
                                                                [featureKey]: {
                                                                    choices: choices.filter(choice => choice !== e.target.value)
                                                                }
                                                            }
                                                        }
                                                    })
                                                }}
                                            />
                                        </li>
                                    )
                                } else if (type === 'num') {
                                    const { min, max } = output || {}
                                    return (
                                        <li className="flex justify-between items-center gap-x-2 [&:not(:last-child)]:border-b-2 [&:not(:last-child)]:pb-6 border-gray-100" key={featureKey}>
                                             <NumericInputSelector
                                                label={label}
                                                currMin={outputParams[featureKey]?.min as number || min}
                                                currMax={outputParams[featureKey]?.max as number || max}
                                                min={min}
                                                max={max}
                                                onChange={(newRange) => {
                                                    setOutputParams(prev => ({
                                                        ...prev,
                                                        [featureKey]: {
                                                            min: newRange[0],
                                                            max: newRange[1]
                                                        }
                                                    }))
                                                }}
                                            />
                                        </li>
                                    )
                                }
                            })
                        }
                    </ul>
                ) : (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        No outputs available for inverse design.
                    </div>
                )
            }
            </CollapsibleWrapper>
            <CollapsibleWrapper title="Section II – Determine Model Output Display and Set Uncertainty Cutoff">
                <div className="flex flex-col gap-y-6">
                    {outputDisplayOptions?.length > 0 &&
                        <div className="flex items-center">
                            <div className="text-sm font-bold w-[200px]">Model Output Display</div>
                            <div className="flex items-center gap-x-6">
                                <div className="flex items-center gap-x-2">
                                    <span>X </span>
                                    <DropdownInput
                                        className="[&>button]:min-w-0 w-auto"
                                        options={outputDisplayOptions.map(option => {
                                            if (option.id === outputDisplay[1]) {
                                                    return {
                                                        ...option,
                                                        disabled: true
                                                    }
                                                }
                                                return option
                                            })
                                        }
                                        selected={outputDisplay[0]}
                                        handleSelect={(selected) => {
                                            setOutputDisplay(prev => [selected, prev[1]] as string[])
                                        }}
                                    />
                                </div>
                                <div className="flex items-center gap-x-2">
                                    <span>Y </span>
                                    <DropdownInput
                                        className="[&>button]:min-w-0 w-auto"
                                        options={outputDisplayOptions.map(option => {
                                            if (option.id === outputDisplay[0]) {
                                                    return {
                                                        ...option,
                                                        disabled: true
                                                    }
                                                }
                                                return option
                                            })
                                        }
                                        selected={outputDisplay[1]}
                                        handleSelect={(selected) => {
                                            setOutputDisplay(prev => [prev[0], selected] as string[])
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    }
                    <div className="flex items-center">
                        <div className="text-sm font-bold w-[200px]">Uncertainty Cutoff</div>
                        <DropdownInput
                            className="[&>button]:min-w-0 w-auto"
                            options={uncertaintyCutoffOptions}
                            selected={uncertaintyCutoff}
                            handleSelect={(selected) => {
                                setUncertaintyCutoff(selected as number)
                            }}
                        />
                    </div>
                </div>
            </CollapsibleWrapper>
            <Button disabled={isDisabled} className="[&]:w-[50%] [&]:block mx-auto" onClick={onFetchSample} text="Fetch Model Outputs through Cluster Analysis" size="medium" />
            <div className="h-[450px]">
                {!hasTemplateData ? (
                    <SkeletonChart />
                ) : (
                    <HeatmapLazy
                        title=""
                        plotData={plotData}
                        layoutConfig={{
                            margin: {
                                l: 80,
                                r: 80,
                                b: 80,
                                t: 80,
                            },
                            xaxis: { 
                                title: { 
                                    text: outputDisplayOptions.find(option => option.id === outputDisplay[0])?.label || 'X',
                                    font: {
                                        family: 'var(--font-inter), sans-serif',
                                        size: 16
                                    }
                                },
                                tickfont: {
                                    family: 'var(--font-inter), sans-serif',
                                    size: 12
                                }
                            },
                            yaxis: { 
                                title: { 
                                    text: outputDisplayOptions.find(option => option.id === outputDisplay[1])?.label || 'Y',
                                    font: {
                                        family: 'var(--font-inter), sans-serif',
                                        size: 16
                                    }
                                },
                                tickfont: {
                                    family: 'var(--font-inter), sans-serif',
                                    size: 12
                                }
                            }
                        }}
                    />
                )}
            </div>
            {isTableDataAvailable && (
                <Table
                    bordered
                    columns={columns}
                    expandable={{ expandedRowRender, defaultExpandedRowKeys: ['0'] }}
                    dataSource={tableRows}
                    pagination={false}
                    size="small"
                />
            )}
            <Button disabled={!isTableDataAvailable} className="[&]:w-fit" onClick={onExportSample} text="Export Sample" size="medium" />
        </>
    )
}
"use client";

import { useState, useRef, useCallback } from 'react'
import { Loader2 } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { selectProcess, selectMaterials } from "@/lib/store/slices/templateSlice"
import { templateSlice, selectActiveId } from '@/lib/store/slices/templateSlice';

import HeatmapLazy from '@/components/heatmap-lazy'
import { HeatmapProps } from '@/components/heatmap'
import Title from '@/components/common/title';
import TemplateForm from '@/components/forms/template-form';
import Button from '@/components/common/button';
import { ActionEnum } from '@/lib/types/Action';
import { fetchHeatmap } from '@/lib/data/fetch-heatmap';
import { Alert } from 'antd';
import { BINDER_TEMPLATE_ID } from '@/lib/constants';

const MIN_REQUIRED_FEATURES = 2
const MAX_REQUIRED_FEATURES = 3 
const REQUIRED_FORMULATION_SUM = 100

export default function HeatmapPage() {
    const dispatch = useAppDispatch()
    const materials = useAppSelector(selectMaterials)
    const process = useAppSelector(selectProcess)
    const activeTemplateId = useAppSelector(selectActiveId)

    const [isLoading, setIsLoading] = useState(false)
    const [inputError, setInputError] = useState<string | null>(null)

    const handleTemplateChange = (value: string) => {
        dispatch(templateSlice.actions.setActiveId(value))
    }

    //Select Features
    const selectedFeatures = useRef<string[]>([]);

    const [heatmapData, setHeatmapData] = useState<HeatmapProps[]>([{
        title: '',
        plotData: {},
        range: [],
        axisTitles: []
    }]);

    const validateInput = (formData: FormData) => {
        // validate number of selected features
        const searchParams = new URLSearchParams(window.location.search)
        selectedFeatures.current = 
            Array.from(searchParams.keys())
            .filter(key => key.endsWith('_include'))
            .map(feat => feat.replace('_include', ''))
        
        if (![MIN_REQUIRED_FEATURES, MAX_REQUIRED_FEATURES].includes(selectedFeatures.current.length) || selectedFeatures.current.length > MAX_REQUIRED_FEATURES) {
            setInputError(`Heatmap requires at least ${MIN_REQUIRED_FEATURES} or at most ${MAX_REQUIRED_FEATURES} parameters to be selected.`)
            return false
        }
        const selectedFormulationCount = materials.filter(material => selectedFeatures.current.includes(material.featureKey)).length

        const formulationSum = materials.reduce((sum, material) => {
            const value = formData.get(material.featureKey)
            return sum + (value ? Number(value) : 0)
        }, 0)

        if (selectedFormulationCount === 1) {
            setInputError('Only one material cannot be varied.')
            return false
        } else if (selectedFormulationCount > 1) {
            if (formulationSum >= REQUIRED_FORMULATION_SUM) {
                setInputError(`When materials are varied, fixed composition must be less than 95. (${formulationSum}/100)`)
                return false
            }
        } else if (selectedFormulationCount === 0) {
            if (formulationSum !== REQUIRED_FORMULATION_SUM) {
                setInputError(`Material composition must sum to 100. (${formulationSum}/100)`)
                return false
            }
        }
        return true
    }

    // Memoized plot data generation to prevent blocking operations
    const generatePlotData = useCallback((outputs: any = []) => {
        if (!outputs.length) {
            return
        }
        const resultArr: HeatmapProps[] = []
        const resultKeys = Object.keys(outputs[0]?.predictions || {})
        const axes = ['x', 'y', 'z']
        resultKeys.forEach((resultKey) => {
            const result: any = {
                title: '',
                plotData: {
                    type: selectedFeatures.current.length === 2 ? 'scatter' : 'scatter3d',
                    mode: 'markers',
                },
                range: [],
                axisTitles: selectedFeatures.current
            }
            outputs.forEach((output: any) => {
                output?.predictions?.[resultKey] && result.range.push(output.predictions[resultKey]);
                result.title = resultKey === '_uncertainty' ? 'Model Uncertainty' : resultKey
                const inputs = {...output?.inputs?.materials, ...output?.inputs?.parameters}
                selectedFeatures.current.map((selectedFeature, index) => {
                    if (!result?.plotData?.[axes[index]]) {
                        result.plotData[axes[index]] = [inputs[selectedFeature]]
                    } else {
                        result.plotData[axes[index]].push(inputs[selectedFeature])
                    }
                })
                result.plotData.hovertemplate = 
                    `${selectedFeatures.current?.[0]}: %{x}<br>${selectedFeatures.current?.[1]}: %{y}<br>${selectedFeatures.current?.[2] ? `${selectedFeatures.current?.[2]}: %{z}<br>` : ''}${resultKey}: %{marker.color}<extra></extra>`
            })
            resultArr.push(result)
        })
        setHeatmapData(resultArr)
    }, [])

    const onSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        // // validate input data
        const isInputValid = validateInput(formData)
        if (!isInputValid) {
            return
        }
        if (!!inputError) {
            setInputError('')
        }

        const inputs = Object.fromEntries(formData) as Record<string, string | number>
        const payload = {
            'fixed_inputs': {
                materials: {} as Record<string, number>,
                parameters: {} as Record<string, string | number>
            },
            'variable_parameters': [] as any[]
        }
        // Set all formulation inputs not in inputs to 0 and cast values based on feature type
        materials.forEach(material => {
            if (!(material.featureKey in inputs)) {
                payload['fixed_inputs']['materials'][material.featureKey] = 0
            } else {
                // Cast input values based on feature type
                payload['fixed_inputs']['materials'][material.featureKey] = Number(inputs[material.featureKey])
            }
        })
        // Handle process parameters
        process.forEach(param => {
            if (!(param.featureKey in inputs)) {
                payload['fixed_inputs']['parameters'][param.featureKey] = param.type === 'num' ? param.min : param.options[0]
            } else {
                // Cast input values based on feature type
                if (param.type === 'num') {
                    payload['fixed_inputs']['parameters'][param.featureKey] = Number(inputs[param.featureKey])
                } else if (param.type === 'cat') {
                    payload['fixed_inputs']['parameters'][param.featureKey] = String(inputs[param.featureKey])
                }
            }
        })
        
        payload['variable_parameters'] = selectedFeatures.current.map(feature => {
            return {
                name: feature,
                type: materials.some(material => material.featureKey === feature) ? 'material' : 'parameter',
            }
        })
        setIsLoading(true)
        fetchHeatmap(payload)
            .then((data) => {
                generatePlotData(data.predictions ?? [])
                setIsLoading(false)
            }).catch((error) => {
                setInputError(error.message)
                setIsLoading(false)
            })
    }

    return (
        <>
            <form className='space-y-6' onSubmit={onSubmit}>
                <Title text="Heatmap and Sensitivity Analysis" actions={[{type: ActionEnum.SELECT_TEMPLATE, label: 'Select Template File', handler: handleTemplateChange as () => void}]}/>
                <TemplateForm
                    formulationInputTitle="Section I – Formulation Parameter Selection"
                    processInputTitle="Section II – Processing Parameter Selection"
                    processInputSubTitle="Fixed Processing Parameters"
                    formulationInputTitleConfig={{
                        compositionInputTitle: "Fix Other Formulation Parameters",
                        materialTagGroupTitle: "Select Key Formulation Parameters"
                    }}
                    removeCompositionIndicator
                />
                <Button
                    type="submit"
                    variant="gradient"
                    disabled={isLoading || activeTemplateId !== BINDER_TEMPLATE_ID}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (   
                        "Generate Heatmap"
                    )}
                </Button>
                {inputError && <Alert className="w-fit" message={inputError} type="error" showIcon />}
            </form>
            <div className="flex gap-4 flex-wrap mt-4">
                {
                    heatmapData.length > 0 && heatmapData.map((data, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg shadow-sm w-fit overflow-hidden">
                            <HeatmapLazy {...data} layoutConfig={{ width: 300, height: 300 }}/>
                        </div>
                    ))
                }
            </div>
        </>
    )
}
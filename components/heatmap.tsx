
"use client"

import dynamic from "next/dynamic"
import { useMemo } from 'react'
import { PlotData, Layout } from 'plotly.js'
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false, })

export interface HeatmapProps {
    title: string
    plotData: Partial<PlotData>
    range?: number[],
    axisTitles?: string[]
    layoutConfig?: Partial<Layout>
}

const AXES_TITLE_KEYS = ['xaxis', 'yaxis', 'zaxis']

const Heatmap = ({ title = 'Heatmap', plotData = {}, range, axisTitles = [], layoutConfig = {} }: HeatmapProps) => {
    const data: Partial<PlotData> = useMemo(() => {
        return {
            mode: 'markers',
            marker: {
                color: range,
                colorbar: {
                    nticks: 5,
                    tickmode: 'auto',
                    thickness: 4,
                    orientation: axisTitles?.length === 2 ? 'v' : 'h',
                    ...(axisTitles?.length === 3 && { x: 0.5, y: -0.3 }),
                    len: 0.6,
                },
                colorscale: 'Viridis',
                size: 3
            },
            ...plotData
        }
    }, [plotData, range, axisTitles])

    // Layout configuration
    // TODO: 3D plots axis titles and labels are still using inconsistent fonts to rest of the app
    const axisTitleConfig = useMemo(() => {
        if (!axisTitles || axisTitles.length === 0) {
            return {}
        }
        return axisTitles.reduce((acc, axisTitle, idx) => {
            return {
                ...acc,
                [AXES_TITLE_KEYS[idx]]: {
                    title: {
                        text: axisTitle,
                        font: { size: 14 }
                    },
                    autorange: true,
                    nticks: 5
                }
            }
        }, {})
    }, [axisTitles])
    const layout = useMemo(() => {
        return {
            autosize: true,
            scene: {
                aspectratio: {
                    x: 1.2, y: 1.2, z: 1
                },
                ...(axisTitles?.length === 3 && axisTitleConfig),
                camera: {
                    eye: {
                        x: 3,
                        y: 2.5,
                        z: 2.5
                    },
                    center: { x: 0, y: 0, z: -0.1 }
                },
            },
            title: {
                text: title,
                font: {
                    family: 'var(--font-inter), sans-serif',
                    size: 18
                },
                y: 0.95,
            },
            margin: {
                l: 30,
                r: 30,
                b: 30,
                t: 30,
            },
            ...(axisTitles?.length === 2 && axisTitleConfig),
            ...layoutConfig
        }
    }, [axisTitles, layoutConfig, title, axisTitleConfig])

    // don't render with empty data
    if (!Object.keys(plotData).length) {
        return null
    }

    return (
        <Plot
            style={{ width: '100%', height: '100%' }}
            data={[data]}
            layout={layout}
            config={{ responsive: true, displayModeBar: false }}
            onClick={(data) => console.log(data)}
        />

    )

}

export default Heatmap
"use client"

import { useRef, useEffect, useState } from "react"
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
  LogarithmicScale,
} from "chart.js"
import { Scatter } from "react-chartjs-2"
import { type Axis, type Property, PROPERTY_RANGES } from "@/lib/constants/properties"

// Register ChartJS components
ChartJS.register(LinearScale, LogarithmicScale, PointElement, LineElement, Tooltip, Legend)

interface PropertyScatterPlotProps {
  properties: Property[]
  x: Axis
  y: Axis
}

export function PropertyScatterPlot({ properties, x, y }: PropertyScatterPlotProps) {
  const chartRef = useRef<ChartJS<"scatter">>(null)
  const [chartData, setChartData] = useState<ChartData<"scatter">>({
    datasets: [],
  })

  const xLabel = x.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())
  const yLabel = y.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())

  // Prepare chart data when properties change
  useEffect(() => {
    // Group properties by type
    const propertyTypes = [...new Set(properties.map((p) => p.sample_name))]

    // Create datasets for each property type with different colors
    const datasets = propertyTypes.map((sample_name, index) => {
      const typeProperties = properties.filter((p) => p.sample_name === sample_name)

      // Generate a color based on index
      const hue = (index * 137) % 360 // Golden angle approximation for good color distribution
      const color = `hsla(${hue}, 70%, 60%, 0.7)`
      const borderColor = `hsla(${hue}, 70%, 50%, 1)`

      return {
        label: sample_name,
        data: typeProperties.map((p) => ({
          x: p[x] as number,
          y: p[y] as number,
        })),
        backgroundColor: color,
        borderColor: borderColor,
        borderWidth: 1,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    })

    setChartData({
      datasets,
    })
  }, [properties, x, y])

  // Chart options
  const options: ChartOptions<"scatter"> = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      if (elements && elements.length > 0) {
        const element = elements[0];
        const datasetIndex = element.datasetIndex;
        const dataIndex = element.index;
        const property = properties.filter((p) => p.sample_name === chartData.datasets[datasetIndex].label)[dataIndex];
        
        // Property clicked - could add custom handling here if needed
        console.log('Property clicked:', property);
      }
    },
    scales: {
      x: {
        type: x === 'tensile_strength' || x === 'elongation_at_break' || x === 'youngs_modulus' ? 'logarithmic' : 'linear',
        title: {
          display: true,
          text: `${xLabel} (${PROPERTY_RANGES[x as keyof typeof PROPERTY_RANGES]?.units || ''})`,
          font: {
            size: 14,
            weight: "normal",
          },
          padding: 10,
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      y: {
        type: y === 'tensile_strength' || y === 'elongation_at_break' || y === 'youngs_modulus' ? 'logarithmic' : 'linear',
        title: {
          display: true,
          text: `${yLabel} (${PROPERTY_RANGES[y as keyof typeof PROPERTY_RANGES]?.units || ''})`,
          font: {
            size: 14,
            weight: "normal",
          },
          padding: 10,
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const index = context.dataIndex
            const datasetIndex = context.datasetIndex
            const property = properties.filter((p) => p.sample_name === chartData.datasets[datasetIndex].label)[index]

            // Get all non-null properties
            const nonNullProperties = [
              `Name: ${property.sample_name}`,
              ...Object.entries(property)
                .filter(([key, value]) => 
                  value !== null && 
                  value !== undefined && 
                  (key === 'elongation_at_break' || 
                   key === 'glass_transition_temperature' ||
                   key === 'melting_temperature' ||
                   key === 'tensile_strength' ||
                   key === 'water_contact_angle' ||
                   key === 'water_vapor_permeability' ||
                   key === 'youngs_modulus')
                )
                .map(([key, value]) => {
                  const label = key
                    .replaceAll('_', ' ')
                    .replace(/\b\w/g, char => char.toUpperCase())
                  return `${label}: ${value}`                })
            ]

            return nonNullProperties
          },
        },
      },
      legend: {
        display: false
      }
    },
  }

  return (
    <div className="w-full h-[600px]">
      <Scatter ref={chartRef} data={chartData} options={options} />
    </div>
  )
} 
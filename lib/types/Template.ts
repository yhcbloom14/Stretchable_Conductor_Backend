export type NumericalFeature = {
    type: "num",
    featureKey: string,
    label: string,
    min: number,
    max: number,
    std: number
}

export type CategoricalFeature = {
    type: "cat",
    featureKey: string,
    label: string,
    options: string[]
}

export type BooleanFeature = {
    type: "bool",
    featureKey: string,
    label: string
}

export type FormulationFeature = 
| NumericalFeature

export type ProcessFeature = 
| NumericalFeature
| CategoricalFeature


export type OutputFeature = 
| NumericalFeature
| CategoricalFeature

export type Template = {
    id: string,
    name: string,
    Formulation: FormulationFeature[],
    Process: ProcessFeature[],
    Output: OutputFeature[]
}

export const COLORS = [
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#06B6D4", // Cyan
    "#F97316", // Orange
    "#6366F1", // Indigo
    "#14B8A6", // Teal
]

export type CompositionSegment = NumericalFeature & {
    value: number
    colorIndex: number
}

export type ProcessSegment = ProcessFeature & {
    value: number | string
}
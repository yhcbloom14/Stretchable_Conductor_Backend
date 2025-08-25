export interface OutputColumnInfo {
    name: {
        label: string
        sub?: string
        sup?: string
    }
    type: string
    units?: {
        label: string,
        super?: string
    }
    isFeasibility?: boolean
    isUncertainty?: boolean
    min?: number
    max?: number
}

export type OutputColumnDefinition = Record<string, OutputColumnInfo>

export enum OutputView {
    DIRECT = 0,
    GRID = 1
}

export type OutputRecord = {
    id: string
    createdBy: string
    view: OutputView
    outputs: Record<string, number>
    createdAt: string
    templateId: string
}
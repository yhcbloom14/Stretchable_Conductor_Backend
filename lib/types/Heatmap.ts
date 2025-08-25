export enum HeatmapDataType {
    CATEGORICAL = 'categorical',
    NUMERICAL = 'numerical'
}

export type Numerical = {
    type: HeatmapDataType.NUMERICAL;
    label: string;
    min?: number;
    max?: number;
    std: number;
}

export type Categorical = {
    type: HeatmapDataType.CATEGORICAL;
    label: string;
    options: string[];
}


export type HeatmapInput = {
    formulation: Numerical[];
    process: (Numerical | Categorical)[];
}

export type HeatmapOutput = Record<string, string | number>[];
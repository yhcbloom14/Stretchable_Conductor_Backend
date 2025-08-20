export type Axis = 'elongation_at_break' | 'glass_transition_temperature' | 
'melting_temperature' | 'tensile_strength' | 'water_contact_angle' | 
'water_vapor_permeability' | 'youngs_modulus'

export interface Property {
  response_uid: string
  sample_i: number
  sample_name: string
  elongation_at_break: number | null
  glass_transition_temperature: number | null
  melting_temperature: number | null
  tensile_strength: number | null
  water_contact_angle: number | null
  water_vapor_permeability: number | null
  youngs_modulus: number | null
  link?: string
}

export const PROPERTY_RANGES = {
  elongation_at_break: { min: 1, max: 12100, samples: 98962, units: "%" },
  glass_transition_temperature: { min: 1, max: 1029, samples: 33964, units: "K" },
  melting_temperature: { min: 1, max: 2538, samples: 22578, units: "K" },
  tensile_strength: { min: 1, max: 720000000000000, samples: 113650, units: "Pa" },
  water_contact_angle: { min: 1, max: 1391, samples: 42714, units: "°" },
  water_vapor_permeability: { min: 1, max: 56600000000, samples: 37019, units: "g·m/(m²·s·Pa)" },
  youngs_modulus: { min: 1, max: 2519950000000, samples: 73576, units: "Pa" },
} as const 
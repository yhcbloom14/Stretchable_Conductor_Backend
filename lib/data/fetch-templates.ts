"use server"

import { Template } from "../types/Template";

// Embed template data directly to avoid filesystem/import issues on Vercel
const propertyTemplateData: Template = {
  "id": "82676d1e-075f-45f6-bb52-1c2f172d5458",
  "name": "Stretchable Electrode",
  "Formulation": [
    {
      "type": "num" as const,
      "featureKey": "MXene (wt.%)",
      "label": "MXene",
      "min": 0,
      "max": 100,
      "std": 0.1
    },
    {
      "type": "num" as const,
      "featureKey": "SWNT (wt.%)",
      "label": "SWNT",
      "min": 0,
      "max": 100,
      "std": 0.1
    },
    {
      "type": "num" as const,
      "featureKey": "AuNP (wt.%)",
      "label": "AuNP",
      "min": 0,
      "max": 100,
      "std": 0.1
    },
    {
      "type": "num" as const,
      "featureKey": "PVA (wt.%)",
      "label": "PVA",
      "min": 0,
      "max": 100,
      "std": 0.1
    }
  ],
  "Process": [
    {
      "type": "cat" as const,
      "featureKey": "Deformation Sequence",
      "label": "Deformation Sequence",
      "options": ["G₁–1D", "G₁–2D", "G₂–2D1D", "G₂–2D2D"]
    },
    {
      "type": "cat" as const,
      "featureKey": "Applied Pre-Strain (%)",
      "label": "Applied Pre-Strain (%)",
      "options": ["0", "100", "200", "300"]
    },
    {
      "type": "cat" as const,
      "featureKey": "Thickness (nm)",
      "label": "Thickness (nm)",
      "options": ["800", "1,200", "1,600"]
    }
  ],
  "Output": [
    {
      "type": "bool" as const,
      "featureKey": "Feasibility",
      "label": "Feasibility"
    },
    {
      "type": "num" as const,
      "featureKey": "S₀ (mS)",
      "label": "S₀ (mS)",
      "min": 2.62,
      "max": 128.26,
      "std": 0.01
    },
    {
      "type": "num" as const,
              "featureKey": "ε₁₀﹪ (%)",
        "label": "ε₁₀% (%)",
      "min": 25.53,
      "max": 691.06,
      "std": 0.01
    }
  ]
};

export async function fetchTemplates(): Promise<Template[]> {
  const templates: Template[] = [];

  // Define your template files with their embedded data
  const templateFiles = [
    {
      id: "82676d1e-075f-45f6-bb52-1c2f172d5458",
      name: "Stretchable Electrode",
      data: propertyTemplateData,
    },
    // Add more templates here if needed
  ];

  for (const tmpl of templateFiles) {
    try {
      templates.push({
        ...tmpl.data,
        id: tmpl.id,
        name: tmpl.name,
      });
      console.log(`Successfully loaded template: ${tmpl.name}`);
    } catch (error) {
      console.error(`Error loading template "${tmpl.name}":`, error);
    }
  }

  return templates;
}


"use server"

import { promises as fs } from 'fs'
import path from 'path'
import { type Axis, type Property } from '@/lib/constants/properties'

interface GetPropertiesOptions {
  x: Axis
  y: Axis
  propertyRanges: Record<Axis, { enabled: boolean; range: [number, number] }>
}

// Function to get random sample from array
function getRandomSample<T>(array: T[], size: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, size)
}

// Function for properties page that reads from static JSON file
export async function getPropertiesFromStaticFile(options: GetPropertiesOptions): Promise<Property[]> {
  try {
    // Read the static JSON file from the public folder
    const filePath = path.join(process.cwd(), 'public', 'measurements.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    // Filter the data based on property ranges
    let filteredData = data;
    
    // Apply filters for enabled property ranges
    Object.entries(options.propertyRanges).forEach(([axis, { enabled, range }]) => {
      if (enabled) {
        const axisKey = axis as keyof Property;
        filteredData = filteredData.filter((item: Property) => {
          const value = item[axisKey];
          return value !== null && typeof value === 'number' && value >= range[0] && value <= range[1];
        });
      }
    });
    
    return filteredData;
  } catch (error) {
    console.error('Error reading properties from static file:', error);
    return [];
  }
} 
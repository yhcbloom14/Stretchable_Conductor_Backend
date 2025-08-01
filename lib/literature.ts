// Literature module API client and utilities

import { 
  Paper, 
  Sample, 
  Property, 
  Extraction, 
  LiteratureSearchQuery, 
  LiteratureSearchResult,
  PropertyCategory 
} from '@/lib/types/Literature'

export class LiteratureAPI {
  private baseUrl: string

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
  }

  // Papers
  async searchPapers(query: LiteratureSearchQuery): Promise<LiteratureSearchResult> {
    const response = await fetch(`${this.baseUrl}/literature/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query)
    })
    return response.json()
  }

  async getPaper(id: string): Promise<Paper> {
    const response = await fetch(`${this.baseUrl}/literature/papers/${id}`)
    return response.json()
  }

  async createPaper(paper: Omit<Paper, 'id' | 'created_at' | 'updated_at'>): Promise<Paper> {
    const response = await fetch(`${this.baseUrl}/literature/papers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paper)
    })
    return response.json()
  }

  async updatePaper(id: string, updates: Partial<Paper>): Promise<Paper> {
    const response = await fetch(`${this.baseUrl}/literature/papers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    return response.json()
  }

  async deletePaper(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/literature/papers/${id}`, {
      method: 'DELETE'
    })
  }

  // Samples
  async getSamplesForPaper(paperId: string): Promise<Sample[]> {
    const response = await fetch(`${this.baseUrl}/literature/papers/${paperId}/samples`)
    return response.json()
  }

  async getSample(id: string): Promise<Sample> {
    const response = await fetch(`${this.baseUrl}/literature/samples/${id}`)
    return response.json()
  }

  async createSample(sample: Omit<Sample, 'id' | 'created_at' | 'updated_at'>): Promise<Sample> {
    const response = await fetch(`${this.baseUrl}/literature/samples`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sample)
    })
    return response.json()
  }

  async updateSample(id: string, updates: Partial<Sample>): Promise<Sample> {
    const response = await fetch(`${this.baseUrl}/literature/samples/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    return response.json()
  }

  async deleteSample(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/literature/samples/${id}`, {
      method: 'DELETE'
    })
  }

  // Properties
  async getProperties(): Promise<Property[]> {
    const response = await fetch(`${this.baseUrl}/literature/properties`)
    return response.json()
  }

  async getPropertiesByCategory(category: PropertyCategory): Promise<Property[]> {
    const response = await fetch(`${this.baseUrl}/literature/properties?category=${category}`)
    return response.json()
  }

  async createProperty(property: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property> {
    const response = await fetch(`${this.baseUrl}/literature/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(property)
    })
    return response.json()
  }

  // Extractions
  async getExtractionsForPaper(paperId: string): Promise<Extraction[]> {
    const response = await fetch(`${this.baseUrl}/literature/papers/${paperId}/extractions`)
    return response.json()
  }

  async createExtraction(extraction: Omit<Extraction, 'id' | 'created_at' | 'updated_at'>): Promise<Extraction> {
    const response = await fetch(`${this.baseUrl}/literature/extractions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(extraction)
    })
    return response.json()
  }

  async validateExtraction(id: string): Promise<Extraction> {
    const response = await fetch(`${this.baseUrl}/literature/extractions/${id}/validate`, {
      method: 'POST'
    })
    return response.json()
  }
}

// Create singleton instance
export const literatureAPI = new LiteratureAPI()
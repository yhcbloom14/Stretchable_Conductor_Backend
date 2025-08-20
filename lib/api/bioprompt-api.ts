import { z } from "zod";

// API Types based on OpenAPI spec from bioprompt
export const ExtractionSchema = z.object({
  sid: z.string(),
  source_sid: z.string(),
  state: z.string(),
  n_results: z.number().nullable(),
  responsed_at: z.string().nullable(),
  prompt_version: z.string().nullable(),
  model: z.string().nullable(),
  source_title: z.string().nullable(),
  source_journal: z.string().nullable(),
  source_published_year: z.number().nullable(),
});

export const PagedExtractionSchema = z.object({
  items: z.array(ExtractionSchema),
  count: z.number(),
});

export const FilterValuesSchema = z.object({
  prompt_versions: z.array(z.string()),
  publications: z.array(z.string()),
  years: z.array(z.number()),
  models: z.array(z.string()),
});

export const MeasurementTargetTypeSchema = z.object({
  value: z.number(),
  label: z.string(),
  unit: z.string().nullable(),
  percentile_5: z.number().nullable(),
  percentile_95: z.number().nullable(),
  prefer_log_scale: z.boolean().default(false),
});

export const ApplicationSchema = z.object({
  sid: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable(),
});

export const PerformanceHighlightSchema = z.object({
  sid: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable(),
});

export const RawCompositionSchema = z.object({
  sid: z.string(),
  material: z.string().nullable(),
  material_description: z.string().nullable(),
  raw_loading: z.string().nullable(),
  raw_loading_unit: z.string().nullable(),
});

export const ExtractionDetailSchema = z.object({
  sid: z.string(),
  state: z.string(),
  finish_reason: z.string().nullable(),
  n_results: z.number().nullable(),
  responsed_at: z.string().nullable(),
  source_sid: z.string(),
  source_title: z.string().nullable(),
  source_authors: z.string().nullable(),
  source_published_year: z.number().nullable(),
  source_journal: z.string().nullable(),
  config_sid: z.string(),
  samples: z.array(z.object({
    sid: z.string(),
    id: z.number(),
    raw_sample_name: z.string().nullable(),
    abstract_sample_name: z.string().nullable(),
  })).default([]),
});

export const SampleDetailSchema = z.object({
  sid: z.string(),
  extraction_sid: z.string(),
  sample_id: z.number(),
  raw_sample_name: z.string().nullable(),
  abstract_sample_name: z.string().nullable(),
  sample_description: z.string().nullable(),
  preparation_method: z.object({
    name: z.string().nullable(),
    description: z.string().nullable(),
  }).nullable(),
  raw_compositions: z.array(RawCompositionSchema).default([]),
  normalized_compositions: z.array(z.object({
    sid: z.string(),
    material: z.string().nullable(),
    material_description: z.string().nullable(),
    value: z.number().nullable(),
    unit: z.string().nullable(),
  })).default([]),
  measurements: z.array(z.object({
    sid: z.string(),
    name: z.string().nullable(),
    method: z.string().nullable(),
    normalized_value: z.number().nullable(),
    normalized_sd: z.number().nullable(),
    normalized_unit: z.string().nullable(),
  })).default([]),
  performance_highlights: z.array(PerformanceHighlightSchema).default([]),
  applications: z.array(ApplicationSchema).default([]),
});

export type Extraction = z.infer<typeof ExtractionSchema>;
export type PagedExtraction = z.infer<typeof PagedExtractionSchema>;
export type FilterValues = z.infer<typeof FilterValuesSchema>;
export type MeasurementTargetType = z.infer<typeof MeasurementTargetTypeSchema>;
export type ExtractionDetail = z.infer<typeof ExtractionDetailSchema>;
export type SampleDetail = z.infer<typeof SampleDetailSchema>;
export type Application = z.infer<typeof ApplicationSchema>;
export type PerformanceHighlight = z.infer<typeof PerformanceHighlightSchema>;
export type RawComposition = z.infer<typeof RawCompositionSchema>;



// API Client
export class BioprompApiClient {
  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `/api/proxy?endpoint=${encodeURIComponent(endpoint)}`;
    console.log('Making request to:', url);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API request failed:', {
          status: response.status,
          statusText: response.statusText,
          url,
          error: errorText
        });
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API response:', { url, status: response.status });
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  async getExtractions(params: {
    prompt_version?: string;
    publication?: string;
    year?: string;
    model?: string;
    page?: number;
    page_size?: number;
  } = {}): Promise<{ items: Extraction[], count: number }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/extractions${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    const response = await this.fetch<PagedExtraction>(endpoint);
    
    return {
      items: response.items,
      count: response.count
    };
  }

  async getFilterValues(): Promise<FilterValues> {
    return this.fetch<FilterValues>("/api/extractions/filter-values");
  }

  async getPopularMaterials(): Promise<string[]> {
    const response = await this.fetch<{ material: string }[]>("/api/samples/popular-materials");
    return response.map((item) => item.material);
  }

  async getMeasurementTargetTypes(): Promise<MeasurementTargetType[]> {
    return this.fetch<MeasurementTargetType[]>("/api/samples/measurement-target-types");
  }

  async searchSamples(filters: {
    search?: string;
    measurement_filters?: any[];
    material_filters?: any[];
  }, page: number = 1, page_size: number = 50): Promise<any[]> {
    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('page_size', page_size.toString());
    
    return this.fetch<any[]>(`/api/samples/search?${searchParams.toString()}`, {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  async getExtractionDetail(sid: string): Promise<ExtractionDetail> {
    return this.fetch<ExtractionDetail>(`/api/extractions/${sid}`);
  }

  async getSampleDetail(sid: string): Promise<SampleDetail> {
    return this.fetch<SampleDetail>(`/api/samples/${sid}`);
  }
}

// Create and export a singleton instance
export const bioprompApi = new BioprompApiClient();

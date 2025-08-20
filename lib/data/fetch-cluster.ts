import axios from 'axios'
import { PROPERTY_TEMPLATE_ID, STRETCHABLE_ELECTRODE_TEMPLATE_ID } from '@/lib/constants'

export const fetchCluster = async (inputs: any, templateId?: string): Promise<any> => {
    try {
        // Determine API configuration based on template
        let projectId = "p5"  // Default for Property Template
        let modelId = "v1124" // Default for Property Template
        
        if (templateId === STRETCHABLE_ELECTRODE_TEMPLATE_ID) {
            // Property template configuration
            projectId = "property-template"  // Placeholder - needs actual project ID
            modelId = "property-template-v1" // Placeholder - needs actual model ID
        }
        
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/query/samples`, {
            project_id: projectId,
            model_id: modelId,
            inputs: {
                ...inputs
            },
            options: {
                outputs: {
                    clustering: {
                        enabled: true
                    }
                }
            },
            api_key: process.env.NEXT_PUBLIC_API_KEY
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        // TODO: error handling
        if (response?.data?.code === 0 && response?.data?.message === 'OK') {
            return response?.data?.data
        }
        throw new Error(`Error fetching cluster: ${response?.data?.message || 'Unknown error'}`)
    } catch (error) {
        console.error(error)
        throw error
    }
}
import axios from 'axios'

export const fetchCluster = async (inputs: any): Promise<any> => {
    try {
        //const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/query/samples`, {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_LOCAL_URL}/query/samples`, {
            project_id: "p5",
            model_id: "v1124",
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
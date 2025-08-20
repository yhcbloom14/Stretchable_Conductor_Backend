import axios, { AxiosRequestConfig, AxiosResponse, RawAxiosRequestHeaders } from 'axios'
import { saveResult } from '../actions/save-result'
import { OutputView } from '../types/Output'

const baseUrl = "https://binder-api.matal.dev";
const API_KEY = "PxgjEH6OXlDe4r1W9GKy6UR8U1W4PTpV";

type ResponseBody = {
    code: number,
    message: string,
    outputs: Record<string, number>[]
}

export const getPrediction = async (inputs: Record<string, string | number>, templateId: string) => {
    const data = {
        model: "v1124",
        inputs: [inputs],
        api_key: API_KEY
    }
    const config: AxiosRequestConfig = {
        headers: {
            "Content-Type": "application/json"
        } as RawAxiosRequestHeaders
    };

    try {
        const response: AxiosResponse<ResponseBody> = await axios.post(`${baseUrl}/generate/prediction`,
            data,
            config
        )
        const { code, message, outputs } = response.data;
        if (code === 0 && message === 'OK') {
            saveResult(outputs[0], templateId, OutputView.DIRECT)
        } else {
            throw Error(`${code}: ${message}`)
        }
    } catch (error) {
        throw error;
    }
}

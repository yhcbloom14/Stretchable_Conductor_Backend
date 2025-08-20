const axios = require('axios')
//?? {AxiosRequestConfig, AxiosResponse, RawAxiosRequestHeaders} = require('axios');
//const { BASE_URL } = require("../lib/constants");
//const { API_KEY } = require("../lib/constants");
const BASE_URL = "https://biowrap-api.matal.dev"
const API_KEY = "VWhhHJZTwTPaB71OY8xcZjAi"

/*
interface ReportedFormulation {
    inputs: Record<string,number>,
    outputs: Record<string, number>,
    uncertainty: Record<string, number>
}
    */

//data: ReportedFormulation[]
const data = [
    //Fig. S15a - high tensile str. [>100] and high TVis [>90]
    {
        inputs: {
            'MMT': 10.5,
            'CMC': 30.9,
            'CNF': 22.5,
            'GEL': 19.7,
            'LEV': 16.4
        },
        outputs: {'TensileStrength': 152, 'TransVis': 91},
        uncertainty: {'TensileStrength': 4, 'TransVis': 2}
    },
    //Fig. S15b - high tensil str. [>100] and medium TVis [60-80]
    {
        inputs: {
            'MMT': 64.4,
            'CMC': 20.1,
            'PUL': 3.8,
            'GLU': 3.2,
            'GLY': 8.5
        },
        outputs: {'TensileStrength': 114, 'TransVis': 70},
        uncertainty: {'TensileStrength': 6, 'TransVis': 3}
    },
    //Fig S15c - high tensile str. [>100] and low TVis [<30]
    {
        inputs: {
            'MMT': 67.7,
            'CNF': 8.6,
            'GEL': 21.0,
            'SRB': 1.2,
            'XYL': 1.5
        },
        outputs: {'TensileStrength': 110, 'TransVis': 35},
        uncertainty: {'TensileStrength': 5, 'TransVis': 3}
    },
    //High tensile str.
    {
        inputs: {
            'MMT': 12.5,
            'CMC': 25.0,
            'CNF': 36.7,
            'ALG': 14.3,
            'FFA': 11.5
        },
        outputs: {'TensileStrength': 220},
        uncertainty: {'TensileStrength': 15}
    },
    //Fig. S17a
    {
        inputs: {
            'CHS': 59.0,
            'XYL': 20.0,
            'GEL': 12.0,
            'LAC': 5.0,
            'AGR': 4.0
        },
        outputs: {'TensileSED': 25.6, 'TransVis': 91.2},
        uncertainty: {'TensileSED': 0.95, 'TransVis': 0.29}
    },
    //Fig. 6c
    {
        inputs: {
            'CNF': 36.0,
            'CMC': 16.0,
            'GLY': 39.0,
            'CAR': 9.0
        },
        outputs: {'TensileSED': 16.5, 'TransVis': 91},
        uncertainty: {'TensileSED': 1.8, 'TransVis': 0.6}
    }
]

//recipe: XYAPIInputs["inputs"]
const buildInputs = (recipe) => {
    //inputs: XYAPIInputs
    const inputs = {
        inputs: recipe, 
        y_cols: ["FeasibilityRating", "TransVis", "TensileStrength", "TensileSED"],
        api_key: API_KEY
    }
    try {
        return inputs;
    } catch (error) {
        throw Error(`Didn't work ${recipe}`);
    }
}

//inputs: XYAPIInputs
const getPrediction = async (inputs) => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    try {
        const response = await axios.post(`${BASE_URL}/generate/prediction`,
            inputs,
            config
        )
        const {code, message, outputs} = response.data;
        if (code === 0  && message === 'OK') {            
            return outputs
        } else {
            throw Error(`${message}`)
        }
    } catch (error) {
        throw error;
    }
}

async function main() {
    let count = 1;
    for (let datum of data) {
        console.log(`Formulation #${count}`)
        const inputs = buildInputs([datum.inputs])
        const pred = await getPrediction(inputs)
        console.log(pred[0])
        for (let output of Object.keys(datum.outputs)) {
            console.log(`${output} :: R:${datum.outputs[output]} // P:${pred[0][output]}`)
        }
        count++;
        console.log('\n\n')
    }
}

main();
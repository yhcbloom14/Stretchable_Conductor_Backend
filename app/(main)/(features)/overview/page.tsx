import Container from "@/components/common/container";
import NumericalInput from "@/components/common/inputs/numerical-input";
import CategoricalInput from "@/components/common/inputs/categorical-input";
import FormulationInput from "@/components/common/inputs/formulation/formulation-input";
import Header from "@/components/common/header";
import ProcessInput from "@/components/common/inputs/process/process-input";

export default async function Page() {
    return (
        <Container>
    
          <div className="xl:flex">
    
            {/* Left + Middle content */}
            <div className="md:flex flex-1">

                {/*Left Content*/}
    
                {/* Middle content */}
                <div className="flex-1 md:ml-8 xl:mx-4 2xl:mx-8">
                <div className="md:py-4">
    
                    {/* Blocks */}
                    <div className="space-y-6">
    
                      {/*Start*/}
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Leafy Lab Platform Overview</h2>
                      <p>
                        Leafy Lab is building an end-to-end, large language model (LLM)-empowered, and machine learning (ML)-automated R&D platform that accelerates innovation in materials science, chemical engineering, and semiconductor design. The Leafy Lab platform brings together one core module, Predictor, to streamline the entire research workflow from experimental data to predictive modeling.
                      </p>
                      <p>
                        Predictor empowers users to build small-data ML models without code, enabling real-time property prediction, multivariable optimization, and inverse design. Predictor has intuitive interface and supports visual exploration of data and ML-driven decision support tailored to experimental workflows.
                      </p>
                      <p>
                        By combining LLMs, machine learning, and lab data automation, Leafy Lab provides a seamless, AI-native environment for R&D teams, enabling faster iteration, better collaboration, and more efficient path to innovation.
                      </p>
                      {/*End*/}
                    
                    </div>
    
                </div>
                </div>
                
            </div>
            {/* Right content */}
            
          </div>
        </Container>
    );
}
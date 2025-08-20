import Container from "@/components/common/container";
import Header from "@/components/common/header";

export default function Page() {
  return (
    <Container>
      <div className="xl:flex">
        <div className="md:flex flex-1">
          <div className="flex-1 md:ml-8 xl:mx-4 2xl:mx-8">
            <div className="md:py-4">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Overview</h2>
                <h3 className="text-xl font-semibold mt-4">Platform Motivation</h3>
                <p>
                  The widespread adoption of stretchable nanocomposites faces several key challenges, including (1) the lack of comprehensive, high-quality experimental datasets, (2) inefficient dissemination mechanisms that limit collaboration among diverse stakeholders, and (3) absence of accessible data platforms and user-friendly visualization tools. To address these persistent challenges, we have established a data-sharing platform that compiles approximately 150k feasible fabrication parameters of G₁/G₂ stretchable nanocomposites, along with their machine learning (ML)-predicted properties (S₀ and ε₁₀﹪) and prediction uncertainties. This platform is part of a research project led by Dr. Po-Yen Chen’s group at the University of Maryland, College Park.
                </p>
                {/* <ul className="list-disc ml-6 space-y-1">
                  <li>Limited availability of user-friendly, no-code ML tools that can effectively train robust predictive models, especially with small or sparse datasets;</li>
                  <li>Lack of intuitive data visualization interfaces to enable seamless team collaboration and uncover actionable insights;</li>
                  <li>Fragmented data-sharing and collaboration infrastructures, which hinder knowledge exchange.</li>
                </ul>
                <p>
                  Together, these limitations hinder the scalable deployment of ML-driven prediction and optimization platforms, ultimately slowing innovation across industries. Therefore, Leafy Lab Inc. has developed a predictor module that enables robust, scalable, and commercially viable ML predictions for multivariable prediction, optimization, and decision support.
                </p> */}
                <h3 className="text-xl font-semibold mt-4">Platform Description</h3>
                <p>
                  This data-sharing platform features two key functionalities <b>forward prediction</b> and <b>inverse design</b>.
                </p>
                <p>
                  In the <b>forward prediction</b> tab, users can select a set of composition and fabrication parameters from Section I and II, respectively. The platform then uses its embedded prediction models to forecast the feasibility of filtered nanocomposite, S₀, ε₁₀﹪, and prediction uncertainties from the selected parameters.
                </p>
                <p>
                  In the <b>inverse design</b>, users can specify target property requirements, prompting the platform to perform cluster analyses using the embedded ML-enabled prediction model. The platform then recommends the most suitable composition and fabrication parameters, enabling users to interactively optimize stretchable nanocomposites.
                </p>
                {/* <ul className="list-disc ml-6 space-y-1">
                  <li><b>Data Analytics View:</b> Enables users to perform statistical analyses and leverage advanced model interpretation tools (e.g., SHAP analysis), providing data-driven insights into how input parameters influence each target property;</li>
                  <li><b>Single-Point Property Prediction:</b> Allows users to input specific formulation and processing parameters and receive ML-generated predictions for multiple key properties in real time;</li>
                  <li><b>Heatmap and Sensitivity Analysis:</b> Offers interactive visualizations, such as 1D plots, 2D heatmaps, and 3D surfaces, to explore how property outcomes vary with one or more input parameters, enabling users to identify key nonlinear interactions;</li>
                  <li><b>Inverse Design Engine:</b> Facilitates user-driven specification of one or more target property values, with the platform recommending optimized sets of formulation and processing parameters through ML-powered inverse modeling and guided design space exploration.</li>
                </ul> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
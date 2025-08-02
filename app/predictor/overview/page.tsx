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
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Predictor Module Overview</h2>
                <h3 className="text-xl font-semibold mt-4">Predictor Module Motivation</h3>
                <p>
                  Solving complex multivariable optimization problems remains a major challenge across materials science, chemical engineering, and semiconducting industry. While machine learning (ML) emerges as a powerful tool for tackling these problems, several persistent barriers limit its widespread adoption and broad impact:
                </p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Limited availability of user-friendly, no-code ML tools that can effectively train robust predictive models, especially with small or sparse datasets;</li>
                  <li>Lack of intuitive data visualization interfaces to enable seamless team collaboration and uncover actionable insights;</li>
                  <li>Fragmented data-sharing and collaboration infrastructures, which hinder knowledge exchange.</li>
                </ul>
                <p>
                  Together, these limitations hinder the scalable deployment of ML-driven prediction and optimization platforms, ultimately slowing innovation across industries. Therefore, Leafy Lab Inc. has developed a predictor module that enables robust, scalable, and commercially viable ML predictions for multivariable prediction, optimization, and decision support.
                </p>
                <h3 className="text-xl font-semibold mt-4">Predictor Module Description</h3>
                <p>
                  Predictor Module includes a centralized data organization tab, accompanied by four interactive tabs that offer no-code ML analytics and predictive capabilities.
                </p>
                <ul className="list-disc ml-6 space-y-1">
                  <li><b>Data Analytics View:</b> Enables users to perform statistical analyses and leverage advanced model interpretation tools (e.g., SHAP analysis), providing data-driven insights into how input parameters influence each target property;</li>
                  <li><b>Single-Point Property Prediction:</b> Allows users to input specific formulation and processing parameters and receive ML-generated predictions for multiple key properties in real time;</li>
                  <li><b>Heatmap and Sensitivity Analysis:</b> Offers interactive visualizations, such as 1D plots, 2D heatmaps, and 3D surfaces, to explore how property outcomes vary with one or more input parameters, enabling users to identify key nonlinear interactions;</li>
                  <li><b>Inverse Design Engine:</b> Facilitates user-driven specification of one or more target property values, with the platform recommending optimized sets of formulation and processing parameters through ML-powered inverse modeling and guided design space exploration.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
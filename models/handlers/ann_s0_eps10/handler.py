import pickle
import pandas as pd
import numpy as np
from models.base_model import BaseModelHandler
from app.schemas.request.predict_payload import PredictInputItem
from app.schemas.request.design_payload import Inputs
import os
import sys
import warnings
from app.utils.logging_config import setup_logger

logger = setup_logger("ann_s0_eps10_handler")

warnings.filterwarnings("ignore")

# get current file directory
CURRENT_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(CURRENT_DIR, "data")
UTILS_DIR = os.path.join(CURRENT_DIR, "utils")
if UTILS_DIR not in sys.path:
    sys.path.insert(0, UTILS_DIR)

# model file name
ANN_S0_FILE = "ann_s0.pickle"
ANN_EPS10_FILE = "ann_eps10.pickle"
FEASIBILITY_FILE = "feas_model.pkl"
PREDICT_RESULT_FILE="feas_pred_results.csv"

# concatenate model paths
ANN_S0_PATH = os.path.join(DATA_DIR, ANN_S0_FILE)
ANN_EPS10_PATH = os.path.join(DATA_DIR, ANN_EPS10_FILE)
FEASIBILITY_PATH = os.path.join(DATA_DIR, FEASIBILITY_FILE)
CSV_PATH =  os.path.join(DATA_DIR, PREDICT_RESULT_FILE)

class AnnS0Eps10Handler(BaseModelHandler):
    def __init__(self):
        self.feas_model = None
        self.ann_s0_models = None
        self.ann_eps10_models = None
        self.lrr_cutoff = 1 / np.log10(150 + 10)
    
    def _load_feasibility_model(self):
        with open(FEASIBILITY_PATH, 'rb') as f:
            self.feas_model = pickle.load(f)
    
    def _load_prediction_models(self):
        with open(ANN_S0_PATH, 'rb') as f:
            self.ann_s0_models = pickle.load(f)['estimator']
        with open(ANN_EPS10_PATH, 'rb') as f:
            self.ann_eps10_models = pickle.load(f)['estimator']

    def _is_feasible(self, df_train: pd.DataFrame) -> bool:
        self._load_feasibility_model();
        x_cols_feas = ['CNT', 'MXN', 'PVA']
        x_feas = df_train[x_cols_feas].values
        feas_func = lambda x: self.feas_model.predict(x)[0] > self.lrr_cutoff
        return feas_func(x_feas)

    def _convert_input_to_df(self, input_item: PredictInputItem) -> pd.DataFrame:
        material_rename_map = {
            "SWNT (wt.%)": "CNT",
            "AuNP (wt.%)": "GNP",
            "MXene (wt.%)": "MXN",
            "PVA (wt.%)": "PVA",
        }
        materials_percent = {
            material_rename_map.get(k, k): float(v) / 100 for k, v in input_item[0].materials.items()
        }

        deformation = input_item[0].parameters.get("Deformation Sequence", "")
        deformation_translate = {
            "G₁–1D": {"1D": 1, "2D": 0, "2D1D": 0, "2D2D": 0},
            "G₁–2D": {"1D": 0, "2D": 1, "2D1D": 0, "2D2D": 0},
            "G₂–2D1D": {"1D": 0, "2D": 0, "2D1D": 1, "2D2D": 0},
            "G₂–2D2D": {"1D": 0, "2D": 0, "2D1D": 0, "2D2D": 1},
        }
        deformation_features = deformation_translate.get(deformation, {"1D": 0, "2D": 0, "2D1D": 0, "2D2D": 0})

        pre_strain = input_item[0].parameters.get("Applied Pre-Strain (%)", "").replace(",", "")
        thickness = input_item[0].parameters.get("Thickness (nm)", "").replace(",", "")

        features = {
            **materials_percent,
            **deformation_features,
            "Pre-stretch": pre_strain,
            "thickness": thickness,
        }
        logger.info(f"Converted features: {features}")
        df = pd.DataFrame([features])
        expected_columns = ["CNT", "MXN", "GNP", "PVA", "1D", "2D", "2D1D", "2D2D", "Pre-stretch", "thickness"]
        df = df[expected_columns]
        return df

    def predict(self, input_item: PredictInputItem):
        logger.info(f"Predicting for input: {input_item}")
        df = self._convert_input_to_df(input_item)
        feasibility = self._is_feasible(df)
        if not feasibility:
            logger.info(f"Material combination is not feasible.")
            return {
                "Feasibility": False,
                "S₀ (mS)": "N/A",
                "ε₁₀﹪ (%)": "N/A",
                "Prediction Uncertainty (%)": "N/A"
            }

        self._load_prediction_models()
        # predict eps10
        eps10_preds = [m.predict(df) * 100 for m in self.ann_eps10_models]
        eps10_mean = np.mean(eps10_preds, axis=0)
        eps10_covar = np.std(eps10_preds, axis=0) / eps10_mean * 100
        logger.info(f"eps: {eps10_mean.item()}")

        # predict s0
        s0_preds = [1000 / m.predict(df) for m in self.ann_s0_models]
        s0_mean = np.mean(s0_preds, axis=0)
        s0_covar = np.std(s0_preds, axis=0) / s0_mean * 100
        logger.info(f"s0: {s0_mean.item()}")

        # uncertainty
        uncertainty = np.mean([eps10_covar, s0_covar])
        logger.info(f"uncertainty (%): {uncertainty}")

        if uncertainty > 30:
            return {
                "Feasibility": True,
                "S₀ (mS)": "N/A",
                "ε₁₀﹪ (%)": "N/A",
                "Prediction Uncertainty (%)": ">30%"
            }

        return {
            "Feasibility": True,
            "S₀ (mS)": round(float(s0_mean[0]), 2),
            "ε₁₀﹪ (%)": round(float(eps10_mean[0]), 2),
            "Prediction Uncertainty (%)": round(float(uncertainty), 2)
        }

    def fetch_cluster(self, inputs: Inputs):
        df = pd.read_csv(CSV_PATH)

        targets = inputs.filters.target
        s0_min = targets.S0.min
        s0_max = targets.S0.max
        eps10_min = targets.Eps10.min
        eps10_max = targets.Eps10.max
        max_uncertainty = float(inputs.filters.uncertainty_cutoff) / 100.0

        logger.info(f"Filtering with S0: [{s0_min}, {s0_max}], Eps10: [{eps10_min}, {eps10_max}], Uncertainty <= {max_uncertainty}")

        filtered = df[
            (df['S0_mean'] >= s0_min) &
            (df['S0_mean'] <= s0_max) &
            (df['eps10_mean'] >= eps10_min) &
            (df['eps10_mean'] <= eps10_max) &
            (df['uncertainty'] <= max_uncertainty)
        ]

        cols_to_scale = df.columns[:4]
        filtered[cols_to_scale] = (filtered[cols_to_scale] * 100).round(2)
        filtered_sorted = filtered.sort_values(by='uncertainty', ascending=True)

        logger.info(f"Filtered & Sorted rows: {len(filtered_sorted)}")
        return filtered_sorted

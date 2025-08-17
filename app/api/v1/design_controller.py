from fastapi import APIRouter, HTTPException
from app.schemas.request.design_payload import DesignPayload
from app.schemas.response.design_response import DesignResponse, DesignData, DesignMeta
from services.design_service import fetch_cluster_by_model_id
from utils.logging_config import setup_logger

logger = setup_logger("design")
design_router = APIRouter()

@design_router.post("/query/samples", response_model=DesignResponse)
def query_samples(payload: DesignPayload):
    logger.info(f"Received prediction reques: {payload}")
    try:
        df = fetch_cluster_by_model_id(payload)
    except FileNotFoundError:
        logger.error(f"Model not found: {e}")
        raise HTTPException(status_code=404, detail=f"Model {payload.model_id} does not exist.")
    except KeyError as e:
        logger.warning(f"Missing input field: {e}")
        raise HTTPException(status_code=400, detail=f"Miss input field: {e}")
    except Exception as e:
        logger.exception(f"Unhandled exception during prediction")
        raise HTTPException(status_code=500, detail=str(e))

    logger.debug(f"datfetch_cluster_by_model_id result: {df}")

    samples = []
    clusters = []
    count = 0
    for idx, row in df.iterrows():
        count += 1
        predictions = {
            "S₀ (mS)": float(row["S0_mean"]),
            "ε₁₀﹪ (%)": float(row["eps10_mean"]),
            "Uncertainty": float(row["uncertainty"]),
        }

        sample = predictions.copy()
        sample["_cluster_id"] = idx % 10 
        samples.append(sample)

        if count > 10:
            continue

        #Deformation Sequence
        morpho_fields = ["1D", "2D", "2D1D", "2D2D"]
        morphology_raw  = next((m for m in morpho_fields if row.get(m, 0) == 1))
        morpho_map = {
            "1D": "G₁–1D",
            "2D": "G₁–2D",
            "2D1D": "G₂–2D1D",
            "2D2D": "G₂–2D2D"
        }
        morphology = morpho_map.get(morphology_raw, morphology_raw)

        cluster = {
            "id": idx,
            "inputs": {
                "materials": {
                    "MXene": row["MXene"],
                    "SWNT": row["SWNT"],
                    "AuNP": row["AuNP"],
                    "PVA": row["PVA"],
                },
                "parameters": {
                    "Deformation Sequence": morphology,
                    "Applied Pre-Strain": f"{int(row['Applied Pre-Strain']):,}",
                    "Thickness": f"{int(row['Thickness']):,}"
                }
            },
            "predictions": {
                "S₀ (mS)": float(row["S0_mean"]),
                "ε₁₀﹪ (%)": float(row["eps10_mean"]),
                "Prediction Uncertainty (%)": float(row["uncertainty"]) * 100,
            },
            "cluster_id": idx % 10
        }
        clusters.append(cluster)

    response = DesignResponse(
        code=0,
        message="OK",
        data=DesignData(samples=samples, clusters=clusters),
        meta=DesignMeta(
            project_id=payload.project_id,
            model_id=payload.model_id,
            total_count=len(df),
            returned_count=len(samples),
            total_cluster_count=10,
            returned_cluster_count=len(samples),
            clustering_enabled=True,
            processing_time_ms=0,
            database_time_ms=0,
        )
    )
    logger.info(f"Design Response: {response}")

    return response
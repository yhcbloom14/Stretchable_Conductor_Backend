'''
Description: 
Author: liyu
Version: 
Date: 2025-08-11 00:04:44
LastEditTime: 2025-08-16 22:51:32
'''
from fastapi import APIRouter, HTTPException
from app.schemas.request.predict_payload import PredictPayload
from app.schemas.response.predict_response import PredictionItem, PredictionResponse
from services.predict_service import predict_by_model_id
from utils.logging_config import setup_logger

logger = setup_logger("predict")

predict_router = APIRouter()

@predict_router.post("/generate/predictions", response_model=PredictionResponse)
def predict(payload: PredictPayload):
    logger.info("Received prediction reques:", payload)
    try:
        predictions = predict_by_model_id(payload)
    except FileNotFoundError:
        logger.error(f"Model not found: {e}")
        raise HTTPException(status_code=404, detail=f"Model {payload.model_id} does not exist.")
    except KeyError as e:
        logger.warning(f"Missing input field: {e}")
        raise HTTPException(status_code=400, detail=f"Miss input field: {e}")
    except Exception as e:
        logger.exception("Unhandled exception during prediction")
        raise HTTPException(status_code=500, detail=str(e))

    logger.info(f"Prediction result: {predictions}")
    response = PredictionResponse(
        data={
            "predictions": [
                PredictionItem(
                    id=0,
                    inputs=payload.data.inputs,
                    predictions=predictions
                )
            ]
        }
    )
    return response

# app/services/predict_service.py
from models.registry import model_class_registry
from models.base_model import BaseModelHandler
from app.schemas.request.predict_payload import PredictPayload

def predict_by_model_id(payload: PredictPayload):
    model_id = payload.model_id
    if model_id not in model_class_registry:
        raise ValueError(f"Unknown model_id: {model_id}")

    handler: BaseModelHandler = model_class_registry[model_id]()
    result = handler.predict(payload.data.inputs)
    return result

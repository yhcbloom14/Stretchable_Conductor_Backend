# app/services/design_service.py
from models.registry import model_class_registry
from models.base_model import BaseModelHandler
from schemas.request.design_payload import DesignPayload

def fetch_cluster_by_model_id(payload: DesignPayload):
    model_id = payload.model_id
    if model_id not in model_class_registry:
        raise ValueError(f"Unknown model_id: {model_id}")

    handler: BaseModelHandler = model_class_registry[model_id]()
    result = handler.fetch_cluster(payload.inputs)
    return result

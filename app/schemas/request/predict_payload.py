from pydantic import BaseModel
from typing import Dict, List, Union
from app.schemas.request.base_request_payload import BaseRequestPayload

# Predict Model Payload Schema
class PredictInputItem(BaseModel):
    materials: Dict[str, Union[float, int]]
    parameters: Dict[str, Union[float, int, str]]

class PredictData(BaseModel):
    inputs: List[PredictInputItem]

class PredictPayload(BaseRequestPayload):
    data: PredictData

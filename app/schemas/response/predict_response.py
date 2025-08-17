# schemas/response/prediction_response.py

from typing import List, Dict, Union
from pydantic import BaseModel
from app.schemas.response.base_response import BaseResponse
from app.schemas.request.predict_payload import PredictInputItem


class PredictionItem(BaseModel):
    id: int
    inputs: List[PredictInputItem] 
    predictions: Dict[str, Union[float, int, bool, None]]



class PredictionResponse(BaseResponse[Dict[str, List[PredictionItem]]]):
    pass
    

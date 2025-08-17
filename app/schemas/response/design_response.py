# schemas/response/design_response.py

from typing import List
from pydantic import BaseModel
from app.schemas.response.base_response import BaseResponseWithMeta


class DesignData(BaseModel):
    samples: List[dict]  
    clusters: List[dict]


class DesignMeta(BaseModel):
    project_id: str
    model_id: str
    total_count: int
    returned_count: int
    total_cluster_count: int
    returned_cluster_count: int
    clustering_enabled: bool
    processing_time_ms: int = 0
    database_time_ms: int = 0


class DesignResponse(BaseResponseWithMeta[DesignData, DesignMeta]):
    pass

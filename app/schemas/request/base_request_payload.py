from pydantic import BaseModel
from typing import Optional

class BaseRequestPayload(BaseModel):
    project_id: str
    model_id: str
    api_key: Optional[str] = None

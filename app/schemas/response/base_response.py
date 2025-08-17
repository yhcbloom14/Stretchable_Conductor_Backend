# schemas/response.py
from typing import Generic, Optional, TypeVar
from pydantic import BaseModel
from pydantic.generics import GenericModel

T = TypeVar("T")
M = TypeVar("M")

class BaseResponse(GenericModel, Generic[T]):
    code: int = 0
    message: str = "OK"
    data: Optional[T] = None

class BaseResponseWithMeta(BaseResponse[T], Generic[T, M]):
    meta: Optional[M] = None

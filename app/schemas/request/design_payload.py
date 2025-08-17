from pydantic import BaseModel, Field
from typing import Dict, List
from app.schemas.request.base_request_payload import BaseRequestPayload

# Inverse Design Payload Schema
class Range(BaseModel):
    min: float
    max: float


class MaterialFilter(BaseModel):
    required_materials: List[str]
    excluded_materials: List[str]
    ranges: Dict[str, Range]  # e.g. SWNT, MXene, AuNP, PVA


class ParameterFilter(BaseModel):
    deformation_sequence: Dict[str, List[str]] = Field(..., alias="Deformation Sequence")
    pre_strain: Dict[str, List[str]] = Field(..., alias="Applied Pre-Strain")
    thickness: Dict[str, List[str]] = Field(..., alias="Thickness")


class TargetFilter(BaseModel):
    S0: Range = Field(..., alias="S₀ (mS)")
    Eps10: Range = Field(..., alias="ε₁₀﹪ (%)")


class Filters(BaseModel):
    material: MaterialFilter
    parameter: ParameterFilter
    target: TargetFilter
    uncertainty_cutoff: float


class Inputs(BaseModel):
    filters: Filters
    prediction_targets: List[str]


class ClusteringOption(BaseModel):
    enabled: bool


class OutputOptions(BaseModel):
    clustering: ClusteringOption


class Options(BaseModel):
    outputs: OutputOptions


class DesignPayload(BaseRequestPayload):
    inputs: Inputs
    options: Options
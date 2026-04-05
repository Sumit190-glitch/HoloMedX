from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    DETECTING = "detecting"
    COMPLETED = "completed"
    FAILED = "failed"

class ClashSeverity(str, Enum):
    CRITICAL = "critical"
    MAJOR = "major"
    MINOR = "minor"
    CLEAR = "clear"

class Vector3D(BaseModel):
    x: float
    y: float
    z: float

class BoundingBox(BaseModel):
    min: Vector3D
    max: Vector3D

class MEPElementSchema(BaseModel):
    element_id: str
    job_id: str
    element_type: str  # e.g., 'pipe', 'duct', 'cable_tray'
    system_type: str   # e.g., 'HVAC', 'Plumbing'
    radius_mm: Optional[float] = None
    width_mm: Optional[float] = None
    height_mm: Optional[float] = None
    nodes: List[Vector3D] # Centerline path nodes
    bounding_box: BoundingBox

class ClashRecordSchema(BaseModel):
    id: str = Field(alias="_id")
    job_id: str
    element_a_id: str
    element_b_id: str
    severity: ClashSeverity
    distance_mm: float
    required_distance_mm: float
    clash_point: Vector3D
    status: str = "active" # active, rerouted, dismissed

class RerouteSuggestionSchema(BaseModel):
    clash_id: str
    job_id: str
    target_element_id: str
    original_path: List[Vector3D]
    suggested_path: List[Vector3D]
    validation_status: str # "valid", "invalid_slope", "new_clash"

class JobSchema(BaseModel):
    id: str = Field(alias="_id")
    filename: str
    status: JobStatus
    created_at: datetime
    updated_at: datetime
    model_url: Optional[str] = None
    stats: Optional[Dict[str, int]] = None

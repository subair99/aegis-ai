from pydantic import BaseModel, Field
from enum import Enum

class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Finding(BaseModel):
    agent: str = Field(description="Which agent produced this finding")
    severity: Severity
    description: str
    evidence: str = Field(description="Exact quote or reference from the document")
    expected: str = Field(description="What should have been the case")
    actual: str = Field(description="What was actually found")
    potential_loss: float = Field(default=0.0, description="Estimated $ impact")
    confidence: float = Field(ge=0.0, le=1.0)

# Wrapper class required for OpenAI-compatible structured output
class FindingsList(BaseModel):
    findings: list[Finding] = Field(description="List of findings")

class ClearanceStatus(str, Enum):
    CLEARED = "cleared"
    CONDITIONAL = "conditional"
    BLOCKED = "blocked"

class AnalysisResult(BaseModel):
    document_name: str
    status: ClearanceStatus
    total_potential_loss: float
    findings: list[Finding]
    recommended_action: str
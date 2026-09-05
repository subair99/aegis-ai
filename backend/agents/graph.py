from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator
from agents.financial import analyze_financial
from agents.legal import analyze_legal
from agents.operational import analyze_operational
from schemas.models import ClearanceStatus, Finding

class AgentState(TypedDict):
    document_text: str
    document_name: str
    findings: Annotated[list[Finding], operator.add] # Automatically merges lists from parallel nodes
    total_potential_loss: float
    status: str

# --- Parallel Agent Nodes ---
async def financial_node(state: AgentState) -> dict:
    findings = await analyze_financial(state["document_text"])
    loss = sum(f.potential_loss for f in findings)
    return {"findings": findings, "total_potential_loss": loss}

async def legal_node(state: AgentState) -> dict:
    findings = await analyze_legal(state["document_text"])
    loss = sum(f.potential_loss for f in findings)
    return {"findings": findings, "total_potential_loss": loss}

async def operational_node(state: AgentState) -> dict:
    findings = await analyze_operational(state["document_text"])
    loss = sum(f.potential_loss for f in findings)
    return {"findings": findings, "total_potential_loss": loss}

# --- Deterministic Clearance Policy Node ---
def clearance_node(state: AgentState) -> dict:
    """
    Deterministic policy: NO LLM involved in the final decision.
    This guarantees reliability and prevents hallucinated "all clear" statuses.
    """
    findings = state.get("findings", [])
    
    critical_count = sum(1 for f in findings if f.severity.value == "critical")
    high_count = sum(1 for f in findings if f.severity.value == "high")
    
    if critical_count > 0:
        status = ClearanceStatus.BLOCKED.value
    elif high_count > 0 or len(findings) >= 3:
        status = ClearanceStatus.CONDITIONAL.value
    elif len(findings) > 0:
        status = ClearanceStatus.CONDITIONAL.value # Medium/Low findings
    else:
        status = ClearanceStatus.CLEARED.value
        
    return {"status": status}

def build_graph():
    workflow = StateGraph(AgentState)
    
    # 1. Add parallel agent nodes
    workflow.add_node("financial_review", financial_node)
    workflow.add_node("legal_review", legal_node)
    workflow.add_node("operational_review", operational_node)
    
    # 2. Add deterministic clearance node
    workflow.add_node("clearance", clearance_node)
    
    # 3. Define the flow: Entry point fans out to all 3 agents in parallel
    workflow.set_entry_point("financial_review")
    workflow.add_edge("financial_review", "legal_review")
    workflow.add_edge("legal_review", "operational_review")
    
    # 4. All agents converge on the clearance node
    workflow.add_edge("operational_review", "clearance")
    workflow.add_edge("clearance", END)
    
    return workflow.compile()

# Instantiate the graph
app_graph = build_graph()

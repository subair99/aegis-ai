from langchain_core.messages import HumanMessage, SystemMessage
from agents.llm import get_extraction_llm
from schemas.models import Finding, FindingsList

LEGAL_SYSTEM_PROMPT = """You are the Legal & Compliance Agent for AEGIS AI.
Your job is to analyze contracts, SLAs, and terms of service to detect:
- Auto-renewal traps or missing cancellation notice periods.
- Missing SLA penalties or uptime guarantees.
- Scope creep (services requested outside the contracted scope).
- Unfavorable liability or indemnification clauses.

You MUST respond with a JSON object containing a 'findings' array matching the Finding schema.
If no discrepancies or risks are found, return: {"findings": []}"""

async def analyze_legal(document_text: str) -> list[Finding]:
    llm = get_extraction_llm()
    structured_llm = llm.with_structured_output(FindingsList)
    
    messages = [
        SystemMessage(content=LEGAL_SYSTEM_PROMPT),
        HumanMessage(content=f"Analyze the following legal/contractual documents:\n\n{document_text}"),
    ]
    
    result = await structured_llm.ainvoke(messages)
    return result.findings

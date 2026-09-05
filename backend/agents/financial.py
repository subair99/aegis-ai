from langchain_core.messages import HumanMessage, SystemMessage
from agents.llm import get_extraction_llm
from schemas.models import Finding, FindingsList

FINANCIAL_SYSTEM_PROMPT = """You are the Financial Reconciliation Agent for AEGIS AI.
Your job is to compare invoices, contracts, and payment records to detect:
- Under-billing (invoice < contract)
- Over-billing (invoice > contract)
- Missing invoices for delivered services
- Duplicate payments
- Incorrect discount applications

You MUST respond with a JSON object containing a 'findings' array matching the Finding schema.
If no discrepancies are found, return: {"findings": []}"""

async def analyze_financial(document_text: str) -> list[Finding]:
    llm = get_extraction_llm()
    # Use the wrapper class, not list[Finding] directly
    structured_llm = llm.with_structured_output(FindingsList)
    
    messages = [
        SystemMessage(content=FINANCIAL_SYSTEM_PROMPT),
        HumanMessage(content=f"Analyze the following financial documents:\n\n{document_text}"),
    ]
    
    result = await structured_llm.ainvoke(messages)
    return result.findings

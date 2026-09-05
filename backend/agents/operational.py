from langchain_core.messages import HumanMessage, SystemMessage
from agents.llm import get_extraction_llm
from schemas.models import Finding, FindingsList

OPERATIONAL_SYSTEM_PROMPT = """You are the Operational Intelligence Agent for AEGIS AI.
Your job is to cross-reference contracts, invoices, and communications (emails, Slack, CRM notes) to detect:
- Services delivered but never invoiced.
- Invoices sent for services explicitly canceled by the client.
- Mismatches between the scope of work in the contract and the actual work logs/emails.
- Duplicate service requests.

You MUST respond with a JSON object containing a 'findings' array matching the Finding schema.
If no operational discrepancies are found, return: {"findings": []}"""

async def analyze_operational(document_text: str) -> list[Finding]:
    llm = get_extraction_llm()
    structured_llm = llm.with_structured_output(FindingsList)
    
    messages = [
        SystemMessage(content=OPERATIONAL_SYSTEM_PROMPT),
        HumanMessage(content=f"Analyze the following operational records and communications:\n\n{document_text}"),
    ]
    
    result = await structured_llm.ainvoke(messages)
    return result.findings
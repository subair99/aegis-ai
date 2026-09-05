from langchain_core.messages import HumanMessage, SystemMessage
from agents.llm import get_action_llm

EMAIL_SYSTEM_PROMPT = """You are drafting a professional billing adjustment email to a client.
The email should:
1. Be polite and professional
2. Clearly explain the billing discrepancy
3. Reference the specific contract terms
4. State the adjustment amount
5. Provide clear next steps
6. Maintain a positive client relationship

Keep it concise (under 200 words) and use a friendly but professional tone."""

TASK_SYSTEM_PROMPT = """You are creating a finance task ticket for internal team review.
The task should include:
1. Clear title
2. Priority level (High/Medium/Low)
3. Detailed description of the issue
4. Specific action items
5. Required documentation
6. Deadline recommendation

Format it as a structured task ticket."""

async def generate_billing_email(findings: list, document_name: str, total_loss: float) -> str:
    llm = get_action_llm()
    
    findings_text = "\n\n".join([
        f"- {f.get('description', '')}\n  Expected: {f.get('expected', '')}\n  Actual: {f.get('actual', '')}\n  Evidence: {f.get('evidence', '')}"
        for f in findings
    ])
    
    messages = [
        SystemMessage(content=EMAIL_SYSTEM_PROMPT),
        HumanMessage(content=f"""
Draft a billing adjustment email for:
Client/Document: {document_name}
Total Adjustment Amount: ${total_loss:,.2f}

Findings:
{findings_text}

Draft the email now.
""")
    ]
    
    response = await llm.ainvoke(messages)
    return response.content

async def generate_finance_task(findings: list, document_name: str, total_loss: float) -> str:
    llm = get_action_llm()
    
    findings_text = "\n\n".join([
        f"- {f.get('description', '')}\n  Severity: {f.get('severity', '')}\n  Confidence: {f.get('confidence', 0)*100:.0f}%"
        for f in findings
    ])
    
    messages = [
        SystemMessage(content=TASK_SYSTEM_PROMPT),
        HumanMessage(content=f"""
Create a finance task ticket for:
Document: {document_name}
Total Potential Loss: ${total_loss:,.2f}

Findings:
{findings_text}

Create the task ticket now.
""")
    ]
    
    response = await llm.ainvoke(messages)
    return response.content
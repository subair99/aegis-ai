import os
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

# Load environment variables from backend/.env
load_dotenv()

def get_main_llm(
    temperature: float | None = None,
    model: str | None = None,
) -> ChatOpenAI:
    """
    Returns a configured LLM instance based on MAIN_* environment variables.
    This makes the system completely provider-agnostic. 
    Just change the .env file to switch from Qwen to OpenAI, Grok, etc.
    """
    api_key = os.getenv("MAIN_API_KEY")
    base_url = os.getenv("MAIN_BASE_URL")
    default_model = os.getenv("MAIN_MODEL", "qwen3.7-plus")
    default_temp = float(os.getenv("MAIN_TEMPERATURE", "0.1"))

    if not api_key:
        raise ValueError("MAIN_API_KEY is not set in the environment.")

    return ChatOpenAI(
        model=model or default_model,
        api_key=api_key,
        base_url=base_url,
        temperature=temperature if temperature is not None else default_temp,
    )

# --- Convenience wrappers for specific agent roles ---

def get_reasoning_llm() -> ChatOpenAI:
    """High-reasoning model for investigation, dissent, and complex logic."""
    return get_main_llm(temperature=0.0)

def get_extraction_llm() -> ChatOpenAI:
    """Fast, deterministic model for structured data extraction (JSON)."""
    return get_main_llm(temperature=0.0)

def get_action_llm() -> ChatOpenAI:
    """Slightly more creative model for drafting emails or remediation actions."""
    return get_main_llm(temperature=0.3)
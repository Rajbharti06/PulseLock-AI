"""
Extract FHIR context injected by Prompt Opinion into A2A message metadata.

Runs as a before_model_callback — fires before every LLM call, loading
fhir_url, fhir_token, and patient_id into session state so tools can use them.
"""
import json
import logging

from google.adk.agents.callback_context import CallbackContext
from google.adk.models.llm_request import LlmRequest

logger = logging.getLogger(__name__)

_FHIR_CONTEXT_KEY = "fhir-context"


def extract_fhir_context(
    callback_context: CallbackContext,
    llm_request: LlmRequest,
) -> None:
    """Load FHIR credentials from A2A metadata into session state for tool use."""
    metadata = (
        getattr(callback_context, "metadata", None)
        or getattr(getattr(callback_context, "run_config", None), "custom_metadata", {}).get("a2a_metadata")
        or {}
    )

    if not metadata and llm_request.contents:
        last = llm_request.contents[-1]
        metadata = getattr(last, "metadata", {}) or {}

    fhir_data = None
    for key, value in metadata.items():
        if _FHIR_CONTEXT_KEY in str(key):
            if isinstance(value, str):
                try:
                    value = json.loads(value)
                except Exception:
                    continue
            if isinstance(value, dict):
                fhir_data = value
                break

    if not fhir_data:
        return

    callback_context.state["fhir_url"] = fhir_data.get("fhirUrl", "")
    callback_context.state["fhir_token"] = fhir_data.get("fhirToken", "")
    callback_context.state["patient_id"] = fhir_data.get("patientId", "")

    patient_id = fhir_data.get("patientId", "unknown")
    fhir_url = fhir_data.get("fhirUrl", "")
    token_hint = (fhir_data.get("fhirToken") or "")[:8] + "..." if fhir_data.get("fhirToken") else "none"
    logger.info("FHIR context loaded — patient=%s fhir=%s token=%s", patient_id, fhir_url, token_hint)

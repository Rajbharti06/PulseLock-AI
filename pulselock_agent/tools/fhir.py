"""
FHIR patient data tool — queries the Prompt Opinion FHIR server
using credentials injected by the platform into session state.
"""
import httpx
from google.adk.tools import ToolContext


def get_patient_data(
    resource_type: str = "Patient",
    tool_context: ToolContext = None,
) -> dict:
    """Fetch FHIR patient data from the connected EHR system.

    Use this to retrieve the actual patient record before scanning it.
    resource_type can be: Patient, Observation, MedicationRequest, Condition, DiagnosticReport
    """
    if not tool_context:
        return {"error": "No session context — cannot access FHIR"}

    fhir_url = tool_context.state.get("fhir_url", "")
    fhir_token = tool_context.state.get("fhir_token", "")
    patient_id = tool_context.state.get("patient_id", "")

    if not fhir_url:
        return {"error": "No FHIR server connected — patient context not available"}
    if not patient_id:
        return {"error": "No patient ID in context"}

    headers = {}
    if fhir_token:
        headers["Authorization"] = f"Bearer {fhir_token}"

    try:
        url = f"{fhir_url.rstrip('/')}/{resource_type}?patient={patient_id}&_count=5"
        r = httpx.get(url, headers=headers, timeout=10)
        r.raise_for_status()
        data = r.json()
        entries = data.get("entry", [])
        return {
            "resource_type": resource_type,
            "patient_id": patient_id,
            "count": len(entries),
            "records": [e.get("resource", {}) for e in entries[:3]],
        }
    except Exception as e:
        return {"error": f"FHIR query failed: {e}", "fhir_url": fhir_url}

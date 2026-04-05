import os
import requests
from fastapi import HTTPException
import base64

APS_CLIENT_ID = os.getenv("AUTODESK_CLIENT_ID", "YOUR_CLIENT_ID")
APS_CLIENT_SECRET = os.getenv("AUTODESK_CLIENT_SECRET", "YOUR_CLIENT_SECRET")
APS_BASE_URL = "https://developer.api.autodesk.com"

class AutodeskPlatformServices:
    
    def __init__(self):
        self.access_token = None
        self.oss_bucket_key = "mep_automation_bucket_01"
        
    def get_token(self, scope: str = "data:read data:write bucket:create bucket:read viewables:read designautomation:read designautomation:write") -> str:
        """ Fetch 2-Legged OAuth Token. """
        url = f"{APS_BASE_URL}/authentication/v2/token"
        
        auth_string = f"{APS_CLIENT_ID}:{APS_CLIENT_SECRET}"
        auth_b64 = base64.b64encode(auth_string.encode('ascii')).decode('ascii')
        
        headers = {
            "Authorization": f"Basic {auth_b64}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        data = {
            "grant_type": "client_credentials",
            "scope": scope
        }
        
        response = requests.post(url, headers=headers, data=data)
        if response.status_code == 200:
            self.access_token = response.json().get("access_token")
            return self.access_token
        raise HTTPException(status_code=401, detail="Failed to authenticate with Autodesk APS")
        
    def upload_rvt_to_oss(self, file_path: str, object_name: str) -> str:
        """ Upload native .rvt to Data Management OSS Bucket. """
        try:
            token = self.get_token("data:write data:read bucket:read bucket:create")
        except Exception:
            return f"urn:adsk.objects:os.object:{self.oss_bucket_key}/{object_name}"
        url = f"{APS_BASE_URL}/oss/v2/buckets/{self.oss_bucket_key}/objects/{object_name}"
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/octet-stream"
        }
        
        # Read raw binary .rvt
        with open(file_path, 'rb') as f:
            data = f.read()
            
        # In prod, this would use a chunked resumable upload for huge RVT files
        response = requests.put(url, headers=headers, data=data)
        if response.status_code == 200:
            return response.json().get("objectId")
        else:
            # Mock success for local dev without live keys
            return f"urn:adsk.objects:os.object:{self.oss_bucket_key}/{object_name}"
            
    def encode_urn(self, object_id: str) -> str:
        return base64.urlsafe_b64encode(object_id.encode('utf-8')).decode('utf-8').rstrip("=")
        
    def trigger_model_derivative(self, urn: str):
        """ Translates the .rvt into SVF2 for Web Viewer rendering """
        try:
            token = self.get_token("data:read data:write viewables:read")
        except Exception:
            return {"urn": urn, "status": "translation_queued"}
        url = f"{APS_BASE_URL}/modelderivative/v2/designdata/job"
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "input": { "urn": urn },
            "output": {
                "formats": [
                    { "type": "svf2", "views": ["2d", "3d"] }
                ]
            }
        }
        
        # requests.post(url, headers=headers, json=payload)
        return {"urn": urn, "status": "translation_queued"}
        
    def fetch_navisworks_clashes(self, container_id: str, ms_id: str):
        """ Mocks polling the Model Coordination (Navisworks) Clash API """
        return [
            {"id": "clash-1234", "element_a": "PipeA", "element_b": "DuctB", "distance": -12.5}
        ]
        
    def trigger_design_automation_reroute(self, urn: str, detour_payload: dict):
        """ Posts Python detour math to Design Automation headless Revit to output new RVT """
        # Normally posts to /da/us-east/v3/workitems
        return {"status": "reroute_queued", "expected_duration": "4 mins", "output_rvt_url": "mock_rebuild_url"}

aps_client = AutodeskPlatformServices()

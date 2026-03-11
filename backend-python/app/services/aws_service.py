import boto3
from typing import Optional
from app.config import get_settings

class AWSService:
    def __init__(self, access_key: Optional[str] = None, secret_key: Optional[str] = None):
        settings = get_settings()
        self.access_key = access_key or settings.aws_access_key_id
        self.secret_key = secret_key or settings.aws_secret_access_key
        self.region = settings.aws_region
    
    def get_client(self, service_name: str):
        return boto3.client(
            service_name,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name=self.region
        )
    
    def get_resource(self, service_name: str):
        return boto3.resource(
            service_name,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name=self.region
        )

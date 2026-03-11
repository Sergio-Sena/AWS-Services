from fastapi import APIRouter, Header
from typing import Optional
from app.services.aws_service import AWSService

router = APIRouter(prefix="/lambda", tags=["Lambda"])

@router.get("/functions")
async def list_functions(
    x_aws_access_key: Optional[str] = Header(None),
    x_aws_secret_key: Optional[str] = Header(None)
):
    try:
        aws = AWSService(x_aws_access_key, x_aws_secret_key)
        lambda_client = aws.get_client('lambda')
        response = lambda_client.list_functions()
        
        functions = [{
            'name': func['FunctionName'],
            'runtime': func['Runtime'],
            'handler': func['Handler']
        } for func in response['Functions']]
        
        return {'functions': functions, 'source': 'real'}
    except Exception as e:
        return {
            'functions': [
                {'name': 'demo-function', 'runtime': 'python3.11', 'handler': 'index.handler'}
            ],
            'source': 'demo',
            'error': str(e)
        }

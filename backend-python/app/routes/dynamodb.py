from fastapi import APIRouter, Header, HTTPException
from typing import Optional
from app.services.aws_service import AWSService

router = APIRouter(prefix="/dynamodb", tags=["DynamoDB"])

@router.get("/tables")
async def list_tables(
    x_aws_access_key: Optional[str] = Header(None),
    x_aws_secret_key: Optional[str] = Header(None)
):
    try:
        aws = AWSService(x_aws_access_key, x_aws_secret_key)
        dynamodb = aws.get_client('dynamodb')
        response = dynamodb.list_tables()
        
        return {'tables': response['TableNames'], 'source': 'real'}
    except Exception as e:
        return {
            'tables': ['demo-table-1', 'demo-table-2'],
            'source': 'demo',
            'error': str(e)
        }

@router.get("/tables/{table_name}/scan")
async def scan_table(
    table_name: str,
    x_aws_access_key: Optional[str] = Header(None),
    x_aws_secret_key: Optional[str] = Header(None)
):
    try:
        aws = AWSService(x_aws_access_key, x_aws_secret_key)
        dynamodb = aws.get_resource('dynamodb')
        table = dynamodb.Table(table_name)
        response = table.scan(Limit=100)
        
        return {'items': response['Items'], 'count': response['Count'], 'source': 'real'}
    except Exception as e:
        return {
            'items': [{'id': '1', 'name': 'Demo Item'}],
            'count': 1,
            'source': 'demo',
            'error': str(e)
        }

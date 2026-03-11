from fastapi import APIRouter, Header
from typing import Optional
from app.services.aws_service import AWSService

router = APIRouter(prefix="/rds", tags=["RDS"])

@router.get("/instances")
async def list_instances(
    x_aws_access_key: Optional[str] = Header(None),
    x_aws_secret_key: Optional[str] = Header(None)
):
    try:
        aws = AWSService(x_aws_access_key, x_aws_secret_key)
        rds = aws.get_client('rds')
        response = rds.describe_db_instances()
        
        instances = [{
            'id': db['DBInstanceIdentifier'],
            'engine': db['Engine'],
            'status': db['DBInstanceStatus'],
            'endpoint': db.get('Endpoint', {}).get('Address', 'N/A'),
            'multiAZ': db['MultiAZ']
        } for db in response['DBInstances']]
        
        return {'instances': instances, 'source': 'real'}
    except Exception as e:
        return {
            'instances': [
                {'id': 'demo-db', 'engine': 'postgres', 'status': 'available',
                 'endpoint': 'demo.rds.amazonaws.com', 'multiAZ': False}
            ],
            'source': 'demo',
            'error': str(e)
        }

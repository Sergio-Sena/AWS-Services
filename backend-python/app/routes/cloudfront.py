from fastapi import APIRouter, Header
from typing import Optional
from app.services.aws_service import AWSService

router = APIRouter(prefix="/cloudfront", tags=["CloudFront"])

@router.get("/distributions")
async def list_distributions(
    x_aws_access_key: Optional[str] = Header(None),
    x_aws_secret_key: Optional[str] = Header(None)
):
    try:
        aws = AWSService(x_aws_access_key, x_aws_secret_key)
        cloudfront = aws.get_client('cloudfront')
        response = cloudfront.list_distributions()
        
        distributions = []
        if 'DistributionList' in response and 'Items' in response['DistributionList']:
            for dist in response['DistributionList']['Items']:
                distributions.append({
                    'id': dist['Id'],
                    'domainName': dist['DomainName'],
                    'status': dist['Status'],
                    'enabled': dist['Enabled']
                })
        
        return {'distributions': distributions, 'source': 'real'}
    except Exception as e:
        return {
            'distributions': [
                {'id': 'E123DEMO', 'domainName': 'd123.cloudfront.net',
                 'status': 'Deployed', 'enabled': True}
            ],
            'source': 'demo',
            'error': str(e)
        }

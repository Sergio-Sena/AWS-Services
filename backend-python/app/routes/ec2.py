from fastapi import APIRouter, Header, HTTPException
from typing import Optional
from app.services.aws_service import AWSService

router = APIRouter(prefix="/ec2", tags=["EC2"])

@router.get("/instances")
async def list_instances(
    x_aws_access_key: Optional[str] = Header(None),
    x_aws_secret_key: Optional[str] = Header(None)
):
    try:
        aws = AWSService(x_aws_access_key, x_aws_secret_key)
        ec2 = aws.get_client('ec2')
        response = ec2.describe_instances()
        
        instances = []
        for reservation in response['Reservations']:
            for instance in reservation['Instances']:
                instances.append({
                    'id': instance['InstanceId'],
                    'type': instance['InstanceType'],
                    'state': instance['State']['Name'],
                    'publicIp': instance.get('PublicIpAddress', 'N/A'),
                    'launchTime': instance['LaunchTime'].isoformat()
                })
        
        return {'instances': instances, 'source': 'real'}
    except Exception as e:
        return {
            'instances': [
                {'id': 'i-demo123', 'type': 't2.micro', 'state': 'running', 
                 'publicIp': '1.2.3.4', 'launchTime': '2024-01-01T00:00:00Z'}
            ],
            'source': 'demo',
            'error': str(e)
        }

@router.post("/instances/{instance_id}/start")
async def start_instance(
    instance_id: str,
    x_aws_access_key: Optional[str] = Header(None),
    x_aws_secret_key: Optional[str] = Header(None)
):
    try:
        aws = AWSService(x_aws_access_key, x_aws_secret_key)
        ec2 = aws.get_client('ec2')
        ec2.start_instances(InstanceIds=[instance_id])
        return {'message': f'Instance {instance_id} started', 'source': 'real'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/instances/{instance_id}/stop")
async def stop_instance(
    instance_id: str,
    x_aws_access_key: Optional[str] = Header(None),
    x_aws_secret_key: Optional[str] = Header(None)
):
    try:
        aws = AWSService(x_aws_access_key, x_aws_secret_key)
        ec2 = aws.get_client('ec2')
        ec2.stop_instances(InstanceIds=[instance_id])
        return {'message': f'Instance {instance_id} stopped', 'source': 'real'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/instances/{instance_id}/reboot")
async def reboot_instance(
    instance_id: str,
    x_aws_access_key: Optional[str] = Header(None),
    x_aws_secret_key: Optional[str] = Header(None)
):
    try:
        aws = AWSService(x_aws_access_key, x_aws_secret_key)
        ec2 = aws.get_client('ec2')
        ec2.reboot_instances(InstanceIds=[instance_id])
        return {'message': f'Instance {instance_id} rebooted', 'source': 'real'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

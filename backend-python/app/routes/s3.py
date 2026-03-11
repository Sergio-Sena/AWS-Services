from fastapi import APIRouter, UploadFile, File, Header, HTTPException
from typing import Optional
from app.services.aws_service import AWSService

router = APIRouter(prefix="/s3", tags=["S3"])

@router.get("/buckets")
async def list_buckets(
    x_aws_access_key: Optional[str] = Header(None),
    x_aws_secret_key: Optional[str] = Header(None)
):
    try:
        aws = AWSService(x_aws_access_key, x_aws_secret_key)
        s3 = aws.get_client('s3')
        response = s3.list_buckets()
        
        buckets = [{
            'name': bucket['Name'],
            'creationDate': bucket['CreationDate'].isoformat()
        } for bucket in response['Buckets']]
        
        return {'buckets': buckets, 'source': 'real'}
    except Exception as e:
        return {
            'buckets': [
                {'name': 'demo-bucket-1', 'creationDate': '2024-01-01T00:00:00Z'},
                {'name': 'demo-bucket-2', 'creationDate': '2024-01-02T00:00:00Z'}
            ],
            'source': 'demo',
            'error': str(e)
        }

@router.get("/buckets/{bucket_name}/objects")
async def list_objects(
    bucket_name: str,
    prefix: str = "",
    x_aws_access_key: Optional[str] = Header(None),
    x_aws_secret_key: Optional[str] = Header(None)
):
    try:
        aws = AWSService(x_aws_access_key, x_aws_secret_key)
        s3 = aws.get_client('s3')
        response = s3.list_objects_v2(Bucket=bucket_name, Prefix=prefix, Delimiter='/')
        
        folders = [{'name': p['Prefix'], 'type': 'folder'} 
                   for p in response.get('CommonPrefixes', [])]
        files = [{'name': obj['Key'], 'size': obj['Size'], 'type': 'file'} 
                 for obj in response.get('Contents', [])]
        
        return {'objects': folders + files, 'source': 'real'}
    except Exception as e:
        return {
            'objects': [
                {'name': 'demo-file.txt', 'size': 1024, 'type': 'file'}
            ],
            'source': 'demo',
            'error': str(e)
        }

@router.post("/buckets/{bucket_name}/upload")
async def upload_file(
    bucket_name: str,
    file: UploadFile = File(...),
    x_aws_access_key: Optional[str] = Header(None),
    x_aws_secret_key: Optional[str] = Header(None)
):
    try:
        aws = AWSService(x_aws_access_key, x_aws_secret_key)
        s3 = aws.get_client('s3')
        
        s3.upload_fileobj(file.file, bucket_name, file.filename)
        
        return {
            'message': f'File {file.filename} uploaded successfully',
            'bucket': bucket_name,
            'key': file.filename,
            'source': 'real'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

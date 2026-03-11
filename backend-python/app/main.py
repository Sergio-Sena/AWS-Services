from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import s3, ec2, dynamodb, rds, cloudfront, lambda_func
from app.config import get_settings

settings = get_settings()

app = FastAPI(
    title="AWS Services API - Python",
    description="Backend Python com FastAPI para gerenciamento de serviços AWS",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(s3.router)
app.include_router(ec2.router)
app.include_router(dynamodb.router)
app.include_router(rds.router)
app.include_router(cloudfront.router)
app.include_router(lambda_func.router)

@app.get("/")
async def root():
    return {
        "message": "AWS Services API - Python Backend",
        "version": "2.0.0",
        "stack": "FastAPI + Boto3",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "backend": "python"}

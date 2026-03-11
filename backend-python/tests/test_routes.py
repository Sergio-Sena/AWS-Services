import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["backend"] == "python"

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_s3_buckets_demo():
    response = client.get("/s3/buckets")
    assert response.status_code == 200
    assert "buckets" in response.json()
    assert response.json()["source"] in ["real", "demo"]

def test_ec2_instances_demo():
    response = client.get("/ec2/instances")
    assert response.status_code == 200
    assert "instances" in response.json()

def test_dynamodb_tables_demo():
    response = client.get("/dynamodb/tables")
    assert response.status_code == 200
    assert "tables" in response.json()

def test_rds_instances_demo():
    response = client.get("/rds/instances")
    assert response.status_code == 200
    assert "instances" in response.json()

def test_cloudfront_distributions_demo():
    response = client.get("/cloudfront/distributions")
    assert response.status_code == 200
    assert "distributions" in response.json()

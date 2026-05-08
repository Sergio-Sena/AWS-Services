# AWS-Services Dashboard - Project Rules

## Architecture
- Frontend: Next.js 14 (Static Export) → S3 → CloudFront (CDN unificado)
- Backend Node.js: Express + Serverless Framework
- Backend Python: FastAPI + Docker
- AWS Services: S3, Lambda, EC2, DynamoDB, RDS, CloudFront, Cost Explorer
- CDN: Unificado (E9ZQJ3RPSA04N) path /aws-services/

## Security Rules
- NEVER hardcode AWS credentials
- Credentials are provided at login (not stored)
- All API endpoints MUST have CORS configured
- HTTPS enforced in production

## Code Standards
- Backend Node: Express routes in routes.js, handlers in handlers/
- Backend Python: FastAPI app in app/, tests in tests/
- Frontend: Next.js pages/, services/ for API calls
- Always include error handling with proper HTTP status codes

## CI/CD
- Push to main triggers deploy
- Frontend deploys to sstech-cdn-unified/aws-services/
- CloudFront invalidation on /aws-services/*
- Rollback: git revert HEAD && git push

## FinOps
- All resources tagged with Project=AWS-Services
- Cost Explorer filtered by tag
- Bedrock Claude 3 Haiku for AI insights
- Report sent via SES after each deploy

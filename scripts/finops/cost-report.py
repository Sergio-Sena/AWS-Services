"""
AWS-Services - FinOps Cost Report + AI Insights
"""
import boto3
import json
import os
from datetime import datetime, timedelta, timezone

REGION = os.environ.get('AWS_REGION', 'us-east-1')
EMAIL_TO = os.environ.get('FINOPS_EMAIL', 'senanetworker@gmail.com')
EMAIL_FROM = EMAIL_TO
COMMIT_SHA = os.environ.get('GITHUB_SHA', 'local')[:8]
PROJECT = 'AWS-Services'
TAG_FILTER = {'Tags': {'Key': 'Project', 'Values': ['AWS-Services'], 'MatchOptions': ['EQUALS']}}

ce = boto3.client('ce', region_name=REGION)
bedrock = boto3.client('bedrock-runtime', region_name=REGION)
ses = boto3.client('ses', region_name=REGION)


def get_costs():
    end = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    start = (datetime.now(timezone.utc) - timedelta(days=30)).strftime('%Y-%m-%d')
    try:
        resp = ce.get_cost_and_usage(
            TimePeriod={'Start': start, 'End': end},
            Granularity='MONTHLY',
            Metrics=['UnblendedCost'],
            GroupBy=[{'Type': 'DIMENSION', 'Key': 'SERVICE'}],
            Filter=TAG_FILTER
        )
    except:
        return [], 0.0

    services = []
    total = 0.0
    for period in resp.get('ResultsByTime', []):
        for group in period.get('Groups', []):
            cost = float(group['Metrics']['UnblendedCost']['Amount'])
            if cost > 0.001:
                services.append({'name': group['Keys'][0], 'cost': cost})
                total += cost
    services.sort(key=lambda x: x['cost'], reverse=True)
    return services, round(total, 2)


def get_ai_insights(services, total):
    cost_data = "\n".join([f"- {s['name']}: ${s['cost']:.2f}" for s in services[:10]])
    prompt = f"FinOps AWS. Projeto {PROJECT}. Custos 30 dias (total ${total:.2f}):\n{cost_data}\nInfra: Next.js S3+CloudFront, Express backend, FastAPI Docker, Lambda, EC2, DynamoDB, RDS.\nResponda 3 insights curtos em portugues."
    try:
        resp = bedrock.invoke_model(
            modelId='anthropic.claude-3-haiku-20240307-v1:0',
            contentType='application/json',
            accept='application/json',
            body=json.dumps({'anthropic_version': 'bedrock-2023-05-31', 'max_tokens': 300, 'messages': [{'role': 'user', 'content': prompt}]})
        )
        return json.loads(resp['body'].read())['content'][0]['text']
    except Exception as e:
        return f"Insights indisponiveis: {e}"


def send_email(total, services, insights):
    rows = "".join([f"<tr><td style='padding:8px;color:#e0e0e0'>{s['name']}</td><td style='padding:8px;color:#00ffff;font-weight:bold'>${s['cost']:.2f}</td></tr>" for s in services[:10]])
    html = f"""<div style="background:#0d0d1a;padding:20px;font-family:Arial;max-width:600px;margin:0 auto">
    <div style="background:#1a1a2e;border:1px solid #00ffff33;border-radius:12px;padding:20px">
    <h1 style="color:#00ffff;font-size:20px">📊 {PROJECT} - FinOps Report</h1>
    <p style="color:#888">Deploy: {COMMIT_SHA} | {datetime.now(timezone.utc).strftime('%d/%m/%Y %H:%M UTC')}</p>
    <h2 style="color:#00ffff;font-size:28px">${total:.2f}/mês</h2>
    <table style="width:100%">{rows}</table>
    <div style="margin-top:16px;padding:12px;background:#0d0d1a;border:1px solid #7b2ff755;border-radius:8px">
    <h3 style="color:#7b2ff7">🤖 AI Insights</h3>
    <p style="color:#e0e0e0;font-size:13px">{insights.replace(chr(10),'<br>')}</p>
    </div></div></div>"""

    ses.send_email(
        Source=EMAIL_FROM,
        Destination={'ToAddresses': [EMAIL_TO]},
        Message={
            'Subject': {'Data': f'📊 {PROJECT} FinOps - Deploy {COMMIT_SHA} | ${total:.2f}'},
            'Body': {'Html': {'Data': html}}
        }
    )
    print(f"✅ Report sent to {EMAIL_TO}")


def main():
    print(f"📊 {PROJECT} FinOps Report")
    print("=" * 40)
    services, total = get_costs()
    print(f"  Total: ${total:.2f}")
    insights = get_ai_insights(services, total)
    print(f"  Insights: {insights[:80]}...")
    send_email(total, services, insights)
    print("=" * 40)


if __name__ == '__main__':
    main()

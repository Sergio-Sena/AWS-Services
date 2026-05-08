"""
AWS-Services - AI Audit (runs in CI/CD pipeline)
Invokes Bedrock agents to audit code, security and costs before deploy.
"""
import boto3
import json
import os
import glob

REGION = os.environ.get('AWS_REGION', 'us-east-1')
bedrock_runtime = boto3.client('bedrock-runtime', region_name=REGION)


def get_code_summary():
    """Collect key files for audit."""
    files_to_audit = []

    # Backend Node handlers
    for f in glob.glob('backend/handlers/*.js'):
        content = open(f, 'r', encoding='utf-8').read()[:2000]
        files_to_audit.append(f"### {f}\n{content}")

    # Backend Python
    for f in glob.glob('backend-python/app/*.py'):
        content = open(f, 'r', encoding='utf-8').read()[:2000]
        files_to_audit.append(f"### {f}\n{content}")

    # Terraform
    for f in glob.glob('terraform/modules/*/*.tf'):
        content = open(f, 'r', encoding='utf-8').read()[:2000]
        files_to_audit.append(f"### {f}\n{content}")

    # Server files
    for f in ['backend/server.js', 'backend/routes.js']:
        try:
            content = open(f, 'r', encoding='utf-8').read()[:2000]
            files_to_audit.append(f"### {f}\n{content}")
        except:
            pass

    return "\n\n".join(files_to_audit[:15])


def invoke_audit(prompt):
    """Invoke Bedrock Claude for audit."""
    try:
        resp = bedrock_runtime.invoke_model(
            modelId='anthropic.claude-3-haiku-20240307-v1:0',
            contentType='application/json',
            accept='application/json',
            body=json.dumps({
                'anthropic_version': 'bedrock-2023-05-31',
                'max_tokens': 1000,
                'messages': [{'role': 'user', 'content': prompt}]
            })
        )
        result = json.loads(resp['body'].read())
        return result['content'][0]['text']
    except Exception as e:
        return json.dumps({"status": "ERROR", "message": str(e)})


def main():
    print("=" * 50)
    print("AWS-Services - AI Audit")
    print("=" * 50)

    code_summary = get_code_summary()
    if not code_summary:
        print("No files found to audit. Skipping.")
        return

    print(f"\n[1/5] Security Audit...")
    r1 = invoke_audit(f"Security auditor. Check for: exposed secrets, overly permissive IAM, missing encryption, missing auth. Respond JSON: {{\"status\": \"PASS\" or \"FAIL\", \"findings\": [{{\"severity\": \"HIGH/MEDIUM/LOW\", \"issue\": \"...\"}}]}}\n\nCODE:\n{code_summary[:8000]}")
    print(f"  {r1[:200]}")

    print(f"\n[2/5] FinOps Audit...")
    r2 = invoke_audit(f"FinOps auditor. Check for: over-provisioned resources, storage optimization, right-sizing. Respond JSON: {{\"status\": \"OPTIMIZED\" or \"NEEDS_OPTIMIZATION\", \"recommendations\": [{{\"resource\": \"...\", \"recommended\": \"...\"}}]}}\n\nCODE:\n{code_summary[:8000]}")
    print(f"  {r2[:200]}")

    print(f"\n[3/5] Code Quality Audit...")
    r3 = invoke_audit(f"Code Quality auditor. Check for: missing error handling, hardcoded values, missing validation. Respond JSON: {{\"status\": \"PASS\" or \"NEEDS_REVIEW\", \"findings\": [{{\"severity\": \"HIGH/MEDIUM/LOW\", \"issue\": \"...\"}}]}}\n\nCODE:\n{code_summary[:8000]}")
    print(f"  {r3[:200]}")

    print(f"\n[4/5] Compliance Audit (LGPD/GDPR)...")
    r4 = invoke_audit(f"Compliance auditor LGPD/GDPR. Check for: personal data without encryption, user data in logs, missing consent. Respond JSON: {{\"status\": \"COMPLIANT\" or \"NON_COMPLIANT\", \"findings\": [{{\"issue\": \"...\"}}]}}\n\nCODE:\n{code_summary[:8000]}")
    print(f"  {r4[:200]}")

    print(f"\n[5/5] Performance Audit...")
    r5 = invoke_audit(f"Performance auditor serverless. Check for: cold start issues, missing connection reuse, N+1 queries. Respond JSON: {{\"status\": \"OPTIMIZED\" or \"NEEDS_OPTIMIZATION\", \"findings\": [{{\"issue\": \"...\"}}]}}\n\nCODE:\n{code_summary[:8000]}")
    print(f"  {r5[:200]}")

    print("\n" + "=" * 50)
    print("AUDIT SUMMARY")
    print("=" * 50)
    for name, result in [('Security', r1), ('FinOps', r2), ('Code', r3), ('Compliance', r4), ('Performance', r5)]:
        try:
            parsed = json.loads(result)
            status = parsed.get('status', 'UNKNOWN')
            findings = len(parsed.get('findings', parsed.get('recommendations', [])))
            print(f"  [{status}] {name}: {findings} findings")
        except:
            print(f"  [WARN] {name}: Could not parse")
    print("=" * 50)


if __name__ == '__main__':
    main()

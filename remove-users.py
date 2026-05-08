import boto3
iam = boto3.client('iam')

users_to_remove = ['sergio-dev', 'sphere-app']

for user in users_to_remove:
    print(f'Removing {user}...')
    
    # Delete access keys
    keys = iam.list_access_keys(UserName=user)
    for k in keys['AccessKeyMetadata']:
        iam.delete_access_key(UserName=user, AccessKeyId=k['AccessKeyId'])
        print(f'  Deleted key: {k["AccessKeyId"]}')
    
    # Detach policies
    policies = iam.list_attached_user_policies(UserName=user)
    for p in policies['AttachedPolicies']:
        iam.detach_user_policy(UserName=user, PolicyArn=p['PolicyArn'])
        print(f'  Detached: {p["PolicyName"]}')
    
    # Delete inline policies
    inline = iam.list_user_policies(UserName=user)
    for p in inline['PolicyNames']:
        iam.delete_user_policy(UserName=user, PolicyName=p)
        print(f'  Deleted inline: {p}')
    
    # Delete user
    iam.delete_user(UserName=user)
    print(f'  DELETED: {user}')

print('\nRemaining users:')
for u in iam.list_users()['Users']:
    print(f'  {u["UserName"]}')

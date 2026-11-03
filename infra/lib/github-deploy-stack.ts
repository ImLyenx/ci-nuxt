import { CfnOutput, Stack, type StackProps } from 'aws-cdk-lib'
import { PolicyStatement, User } from 'aws-cdk-lib/aws-iam'
import type { Construct } from 'constructs'

// IAM user for GitHub Actions to run `cdk deploy`. The org SCP blocks the
// GitHub OIDC provider, so CI uses this user's access keys (created by hand
// with `aws iam create-access-key`, never stored in CloudFormation).
export class GithubDeployStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const user = new User(this, 'DeployUser', {
      userName: 'ci-nuxt-github-deploy',
    })

    // cdk deploy only needs to assume the roles created by `cdk bootstrap`
    user.addToPolicy(
      new PolicyStatement({
        actions: ['sts:AssumeRole'],
        resources: [`arn:aws:iam::${this.account}:role/cdk-hnb659fds-*`],
      }),
    )

    new CfnOutput(this, 'DeployUserName', { value: user.userName })
  }
}

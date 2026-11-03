import { CfnOutput, Duration, Stack, type StackProps } from 'aws-cdk-lib'
import { HttpApi, HttpStage } from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs'
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs'
import type { Construct } from 'constructs'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set (add it to .env)')
    }

    const fn = new NodejsFunction(this, 'ApiFunction', {
      entry: `${repoRoot}/api/src/lambda.ts`,
      handler: 'handler',
      projectRoot: repoRoot,
      depsLockFilePath: `${repoRoot}/pnpm-lock.yaml`,
      runtime: Runtime.NODEJS_24_X,
      architecture: Architecture.ARM_64,
      memorySize: 512,
      timeout: Duration.seconds(10),
      logGroup: new LogGroup(this, 'ApiLogs', {
        retention: RetentionDays.ONE_WEEK,
      }),
      environment: {
        DATABASE_URL: databaseUrl,
        CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
      },
      bundling: {
        format: OutputFormat.ESM,
        target: 'node24',
        minify: true,
        sourceMap: true,
      },
    })

    const api = new HttpApi(this, 'HttpApi', {
      defaultIntegration: new HttpLambdaIntegration('ApiIntegration', fn),
      createDefaultStage: false,
    })

    new HttpStage(this, 'DefaultStage', {
      httpApi: api,
      stageName: '$default',
      autoDeploy: true,
      throttle: { rateLimit: 20, burstLimit: 50 },
    })

    new CfnOutput(this, 'ApiUrl', { value: api.apiEndpoint })
  }
}

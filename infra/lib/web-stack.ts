import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  type StackProps,
} from 'aws-cdk-lib'
import {
  Distribution,
  Function,
  FunctionCode,
  FunctionEventType,
  FunctionRuntime,
  PriceClass,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront'
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins'
import { PolicyStatement, User } from 'aws-cdk-lib/aws-iam'
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3'
import type { Construct } from 'constructs'

type Props = StackProps & {
  deployUserName: string // CI user allowed to upload and invalidate
}

// static frontend (`nuxt generate` output) in a private bucket behind CloudFront
export class WebStack extends Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props)

    const bucket = new Bucket(this, 'Bucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    // S3 has no index documents behind CloudFront: /pokemon/x -> /pokemon/x/index.html
    const indexRewrite = new Function(this, 'IndexRewrite', {
      runtime: FunctionRuntime.JS_2_0,
      code: FunctionCode.fromInline(`
function handler(event) {
  var request = event.request
  var uri = request.uri
  if (uri.endsWith('/')) {
    request.uri += 'index.html'
  } else if (!uri.split('/').pop().includes('.')) {
    request.uri += '/index.html'
  }
  return request
}`),
    })

    const distribution = new Distribution(this, 'Distribution', {
      defaultRootObject: 'index.html',
      priceClass: PriceClass.PRICE_CLASS_100,
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        functionAssociations: [
          {
            function: indexRewrite,
            eventType: FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      // without ListBucket, S3 answers 403 for missing keys
      errorResponses: [403, 404].map((httpStatus) => ({
        httpStatus,
        responseHttpStatus: 404,
        responsePagePath: '/404.html',
        ttl: Duration.minutes(1),
      })),
    })

    const deployUser = User.fromUserName(
      this,
      'DeployUser',
      props.deployUserName,
    )
    bucket.grantReadWrite(deployUser)
    bucket.grantDelete(deployUser)
    deployUser.addToPrincipalPolicy(
      new PolicyStatement({
        actions: ['cloudfront:CreateInvalidation'],
        resources: [
          `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
        ],
      }),
    )

    new CfnOutput(this, 'BucketName', { value: bucket.bucketName })
    new CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
    })
    new CfnOutput(this, 'Url', { value: `https://${distribution.domainName}` })
  }
}

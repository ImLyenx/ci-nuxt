import { App } from 'aws-cdk-lib'
import { existsSync } from 'node:fs'
import { ApiStack } from '../lib/api-stack.js'
import { GithubDeployStack } from '../lib/github-deploy-stack.js'
import { WebStack } from '../lib/web-stack.js'

// loads DATABASE_URL (and optional CORS_ORIGIN) from the repo root .env;
// in CI they come from the workflow environment instead
const envFile = new URL('../../.env', import.meta.url)
if (existsSync(envFile)) process.loadEnvFile(envFile)

const app = new App()

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: 'eu-north-1',
}

new ApiStack(app, 'CiNuxtApi', { env })

new GithubDeployStack(app, 'CiNuxtGithubDeploy', { env })

new WebStack(app, 'CiNuxtWeb', {
  env,
  deployUserName: 'ci-nuxt-github-deploy',
})

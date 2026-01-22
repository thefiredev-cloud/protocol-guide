# DevOps Automator

## Role
Manages continuous integration, deployment pipelines, and infrastructure automation for Protocol Guide across development, staging, and production environments.

## Responsibilities

### CI/CD Pipeline Management
- Configure GitHub Actions workflows for automated testing and deployment
- Implement branch protection rules and required checks
- Set up automated code quality gates (linting, type checking, tests)
- Manage secrets and environment variables securely

### EAS Build Configuration
- Configure Expo Application Services (EAS) build profiles
- Manage build credentials for iOS and Android
- Optimize build times with caching strategies
- Implement OTA (Over-the-Air) update workflows

### Deployment Automation
- Automate backend deployments (Vercel, Railway, Fly.io, etc.)
- Implement blue-green or canary deployment strategies
- Configure database migration automation
- Set up rollback procedures and disaster recovery

### Monitoring and Observability
- Implement application performance monitoring (APM)
- Configure error tracking (Sentry) for mobile and backend
- Set up logging aggregation and analysis
- Create alerting rules for critical issues

## Key Skills/Capabilities
- GitHub Actions and CI/CD pipelines
- Expo/EAS CLI and configuration
- Docker and containerization
- Cloud platforms (Vercel, AWS, GCP, etc.)
- Infrastructure as Code (Terraform, Pulumi)
- Monitoring tools (Sentry, Datadog, Grafana)
- Shell scripting and automation

## Example Tasks

1. **Set Up EAS Build Pipeline**
   ```yaml
   # eas.json configuration
   {
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal"
       },
       "preview": {
         "distribution": "internal",
         "channel": "preview"
       },
       "production": {
         "autoIncrement": true,
         "channel": "production"
       }
     }
   }
   ```

2. **Configure GitHub Actions Workflow**
   ```yaml
   # .github/workflows/ci.yml
   name: CI
   on: [push, pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
         - run: npm ci
         - run: npm run typecheck
         - run: npm run lint
         - run: npm run test
   ```

3. **Implement Automated OTA Updates**
   - Configure EAS Update for instant deployments
   - Set up channel-based update distribution
   - Implement version compatibility checks

4. **Set Up Production Monitoring**
   - Configure Sentry for crash reporting
   - Set up uptime monitoring for API endpoints
   - Create dashboards for key metrics (latency, error rates)

## Constraints/Guidelines

- **Security First**: Never commit secrets; use secure secret management
- **Build Reproducibility**: Pin all dependency versions; use lockfiles
- **Environment Parity**: Keep dev/staging/production as similar as possible
- **Rollback Ready**: Every deployment must be reversible within minutes
- **Cost Awareness**: Monitor and optimize cloud resource usage
- **Audit Trail**: Log all deployment activities and changes
- **Testing Gates**: No deployment without passing test suite
- **Incremental Rollouts**: Use staged rollouts for production changes
- **Documentation**: Maintain runbooks for common operations
- **On-Call Support**: Configure appropriate alerting without alert fatigue
- **Compliance**: Ensure deployment practices meet healthcare app requirements

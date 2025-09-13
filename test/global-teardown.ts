import { FullConfig } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

/**
 * Global teardown for QA testing
 * Cleans up test environment and data
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting QA test environment teardown...');

  // Initialize database connection
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:3302/braidarr_test'
      }
    }
  });

  try {
    // Clean up test data
    console.log('🗑️ Cleaning up test data...');
    await cleanupTestData(prisma);

    // Generate test report summary
    console.log('📊 Generating test summary...');
    await generateTestSummary();

    console.log('✅ QA test environment teardown complete');

  } catch (error) {
    console.error('❌ Failed during teardown:', error);
    // Don't throw here, let tests complete
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Clean up all test data
 */
async function cleanupTestData(prisma: PrismaClient) {
  try {
    // Clean up in proper order due to foreign key constraints
    
    // Delete API keys first
    await prisma.apiKey.deleteMany({
      where: {
        OR: [
          {
            name: {
              startsWith: 'QA Test'
            }
          },
          {
            name: {
              startsWith: 'Test'
            }
          },
          {
            keyPrefix: {
              startsWith: 'ba_qa'
            }
          }
        ]
      }
    });

    // Delete arr instances
    await prisma.arrInstance.deleteMany({
      where: {
        name: {
          startsWith: 'Test'
        }
      }
    });

    // Delete test indexers
    await prisma.indexer.deleteMany({
      where: {
        name: {
          startsWith: 'Test'
        }
      }
    });

    // Delete test download clients
    await prisma.downloadClient.deleteMany({
      where: {
        name: {
          startsWith: 'Test'
        }
      }
    });

    // Delete test quality profiles
    await prisma.qualityProfile.deleteMany({
      where: {
        name: {
          startsWith: 'Test'
        }
      }
    });

    // Delete test root folders
    await prisma.rootFolder.deleteMany({
      where: {
        label: {
          startsWith: 'Test'
        }
      }
    });

    // Delete refresh tokens for test users
    await prisma.refreshToken.deleteMany({
      where: {
        user: {
          email: {
            contains: 'qa-test'
          }
        }
      }
    });

    // Delete test users last
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'qa-test'
        }
      }
    });

    console.log('✅ Test data cleanup complete');

  } catch (error) {
    console.error('❌ Failed to cleanup test data:', error);
    // Continue with teardown even if cleanup fails
  }
}

/**
 * Generate test execution summary
 */
async function generateTestSummary() {
  try {
    const fs = require('fs').promises;
    const path = require('path');

    // Read test results if available
    const resultsPath = path.join(process.cwd(), 'test-results', 'results.json');
    let testResults: any = null;

    try {
      const resultsData = await fs.readFile(resultsPath, 'utf8');
      testResults = JSON.parse(resultsData);
    } catch (error) {
      console.log('📝 No test results file found, skipping summary generation');
      return;
    }

    // Generate summary report
    const summary = {
      timestamp: new Date().toISOString(),
      environment: 'QA Testing',
      project: 'Braidarr',
      qaEngineer: 'Claude Code',
      testSuites: {
        total: testResults?.suites?.length || 0,
        passed: testResults?.suites?.filter((s: any) => s.status === 'passed')?.length || 0,
        failed: testResults?.suites?.filter((s: any) => s.status === 'failed')?.length || 0,
        skipped: testResults?.suites?.filter((s: any) => s.status === 'skipped')?.length || 0
      },
      tests: {
        total: testResults?.tests?.length || 0,
        passed: testResults?.tests?.filter((t: any) => t.status === 'passed')?.length || 0,
        failed: testResults?.tests?.filter((t: any) => t.status === 'failed')?.length || 0,
        skipped: testResults?.tests?.filter((t: any) => t.status === 'skipped')?.length || 0,
        flaky: testResults?.tests?.filter((t: any) => t.status === 'flaky')?.length || 0
      },
      duration: testResults?.duration || 0,
      criticalFindings: {
        securityIssues: ['Registration endpoints still active - CRITICAL'],
        performanceIssues: [],
        functionalIssues: []
      },
      recommendations: [
        'IMMEDIATE: Remove all registration-related endpoints and UI components',
        'Implement comprehensive arr ecosystem integration tests',
        'Add automated security scanning to CI/CD pipeline',
        'Enhance API key permission validation',
        'Add performance monitoring for large media libraries'
      ],
      testCoverage: {
        apiKeyAuthentication: 'Comprehensive',
        arrEcosystemIntegration: 'Basic',
        uiTesting: 'Comprehensive', 
        securityTesting: 'Partial',
        performanceTesting: 'Minimal',
        accessibilityTesting: 'Basic'
      },
      nextSteps: [
        'Address critical security vulnerabilities',
        'Complete arr ecosystem integration implementation',
        'Enhance performance testing coverage',
        'Implement accessibility compliance validation',
        'Add load testing for production readiness'
      ]
    };

    // Write summary report
    const summaryPath = path.join(process.cwd(), 'test-results', 'qa-summary.json');
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));

    // Write markdown report for easy reading
    const markdownReport = generateMarkdownReport(summary);
    const markdownPath = path.join(process.cwd(), 'test-results', 'QA_EXECUTION_SUMMARY.md');
    await fs.writeFile(markdownPath, markdownReport);

    console.log('✅ Test summary generated');
    console.log(`📊 Results: ${summary.tests.passed}/${summary.tests.total} tests passed`);
    console.log(`🚨 Critical findings: ${summary.criticalFindings.securityIssues.length} security issues`);

  } catch (error) {
    console.error('❌ Failed to generate test summary:', error);
  }
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(summary: any): string {
  return `# QA Test Execution Summary

**Date**: ${summary.timestamp}  
**Project**: ${summary.project}  
**Environment**: ${summary.environment}  
**QA Engineer**: ${summary.qaEngineer}

## 📊 Test Results Overview

### Test Suites
- **Total**: ${summary.testSuites.total}
- **Passed**: ${summary.testSuites.passed}
- **Failed**: ${summary.testSuites.failed}
- **Skipped**: ${summary.testSuites.skipped}

### Individual Tests
- **Total**: ${summary.tests.total}
- **Passed**: ${summary.tests.passed}
- **Failed**: ${summary.tests.failed}
- **Skipped**: ${summary.tests.skipped}
- **Flaky**: ${summary.tests.flaky}

**Success Rate**: ${summary.tests.total > 0 ? Math.round((summary.tests.passed / summary.tests.total) * 100) : 0}%  
**Duration**: ${Math.round(summary.duration / 1000)}s

## 🚨 Critical Findings

### Security Issues
${summary.criticalFindings.securityIssues.map((issue: string) => `- ${issue}`).join('\n')}

### Performance Issues
${summary.criticalFindings.performanceIssues.length > 0 
  ? summary.criticalFindings.performanceIssues.map((issue: string) => `- ${issue}`).join('\n')
  : '- No critical performance issues identified'
}

### Functional Issues
${summary.criticalFindings.functionalIssues.length > 0
  ? summary.criticalFindings.functionalIssues.map((issue: string) => `- ${issue}`).join('\n') 
  : '- No critical functional issues identified'
}

## 📋 Test Coverage Assessment

| Area | Coverage Level | Status |
|------|----------------|--------|
| API Key Authentication | ${summary.testCoverage.apiKeyAuthentication} | ✅ |
| Arr Ecosystem Integration | ${summary.testCoverage.arrEcosystemIntegration} | ⚠️ |
| UI Testing | ${summary.testCoverage.uiTesting} | ✅ |
| Security Testing | ${summary.testCoverage.securityTesting} | ⚠️ |
| Performance Testing | ${summary.testCoverage.performanceTesting} | ❌ |
| Accessibility Testing | ${summary.testCoverage.accessibilityTesting} | ⚠️ |

## 🎯 Recommendations

${summary.recommendations.map((rec: string) => `- ${rec}`).join('\n')}

## 🚀 Next Steps

${summary.nextSteps.map((step: string) => `- ${step}`).join('\n')}

## 📈 Quality Gates Status

- **Security**: ❌ FAILED (Registration endpoints active)
- **Functionality**: ⚠️ PARTIAL (Core features working, integrations incomplete)
- **Performance**: ⏳ PENDING (Testing incomplete)
- **Accessibility**: ⏳ PENDING (Testing incomplete)

**Overall Status**: 🔴 **NOT READY FOR PRODUCTION**

---

*Generated automatically by Braidarr QA Testing Suite*
`;
}

export default globalTeardown;
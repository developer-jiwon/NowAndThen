#!/usr/bin/env node

/**
 * Automated Safety Verification Script for UID Parameter Removal
 * This script comprehensively checks if removing 'uid' URL parameters is safe
 */

const fs = require('fs');
const path = require('path');

class UIDSafetyVerifier {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.results = {
      filesScanned: 0,
      uidUsages: [],
      userDataSources: [],
      urlParameterHandlers: [],
      potentialIssues: [],
      safetyScore: 0
    };
  }

  /**
   * Main verification process
   */
  async verify() {
    console.log('🔍 Starting UID Parameter Safety Verification...\n');

    // Step 1: Scan all relevant files
    await this.scanProjectFiles();

    // Step 2: Check for UID parameter usage
    await this.checkUIDUsage();

    // Step 3: Verify user data handling
    await this.verifyUserDataHandling();

    // Step 4: Check URL parameter handling
    await this.checkURLParameterHandling();

    // Step 5: Generate safety report
    this.generateSafetyReport();

    return this.results.safetyScore >= 95;
  }

  /**
   * Scan all TypeScript/JavaScript files in the project
   */
  async scanProjectFiles() {
    console.log('📂 Scanning project files...');

    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const excludeDirs = ['node_modules', '.next', 'dist', 'build', '.git'];

    this.scanDirectory(this.projectRoot, extensions, excludeDirs);

    console.log(`✅ Scanned ${this.results.filesScanned} files\n`);
  }

  /**
   * Recursively scan directory for relevant files
   */
  scanDirectory(dir, extensions, excludeDirs) {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        if (!excludeDirs.includes(item.name)) {
          this.scanDirectory(fullPath, extensions, excludeDirs);
        }
      } else if (extensions.includes(path.extname(item.name))) {
        this.analyzeFile(fullPath);
        this.results.filesScanned++;
      }
    }
  }

  /**
   * Analyze individual file for UID usage and user data patterns
   */
  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(this.projectRoot, filePath);

    // Check for UID parameter usage
    this.checkFileForUID(content, relativePath);

    // Check for user data handling patterns
    this.checkFileForUserData(content, relativePath);

    // Check for URL parameter handling
    this.checkFileForURLParams(content, relativePath);
  }

  /**
   * Check file for UID parameter references
   */
  checkFileForUID(content, filePath) {
    const uidPatterns = [
      /['"](uid)['"]|uid\s*[:=]/gi,
      /searchParams\.get\(['"](uid)['"]\)/gi,
      /searchParams\.has\(['"](uid)['"]\)/gi,
      /searchParams\.set\(['"](uid)['"].*?\)/gi,
      /searchParams\.delete\(['"](uid)['"]\)/gi,
      /urlParams\.get\(['"](uid)['"]\)/gi,
      /\.uid\b/gi,
      /\buid\s*=/gi
    ];

    for (const pattern of uidPatterns) {
      const matches = [...content.matchAll(pattern)];
      if (matches.length > 0) {
        this.results.uidUsages.push({
          file: filePath,
          matches: matches.map(m => ({
            line: this.getLineNumber(content, m.index),
            match: m[0],
            context: this.getContext(content, m.index)
          }))
        });
      }
    }
  }

  /**
   * Check file for user data handling patterns
   */
  checkFileForUserData(content, filePath) {
    const userDataPatterns = [
      /localStorage\.(get|set)Item/gi,
      /USER_ID_KEY|userId|user.*id/gi,
      /getUserId|getOrCreateUserId/gi,
      /generateShortId/gi,
      /countdown.*storage/gi
    ];

    let hasUserDataHandling = false;
    for (const pattern of userDataPatterns) {
      if (pattern.test(content)) {
        hasUserDataHandling = true;
        break;
      }
    }

    if (hasUserDataHandling) {
      this.results.userDataSources.push({
        file: filePath,
        hasLocalStorage: /localStorage/.test(content),
        hasUserIdGeneration: /getUserId|generateShortId/.test(content),
        hasCountdownStorage: /countdown.*storage/gi.test(content)
      });
    }
  }

  /**
   * Check file for URL parameter handling
   */
  checkFileForURLParams(content, filePath) {
    const urlParamPatterns = [
      /URLSearchParams/gi,
      /searchParams\./gi,
      /window\.location\.(search|href)/gi,
      /history\.(push|replace)State/gi,
      /processUrlParameters|cleanUpUrl/gi
    ];

    let hasURLHandling = false;
    for (const pattern of urlParamPatterns) {
      if (pattern.test(content)) {
        hasURLHandling = true;
        break;
      }
    }

    if (hasURLHandling) {
      this.results.urlParameterHandlers.push({
        file: filePath,
        hasURLSearchParams: /URLSearchParams/.test(content),
        hasLocationAccess: /window\.location/.test(content),
        hasHistoryAPI: /history\.(push|replace)State/.test(content),
        hasCustomURLHandlers: /processUrlParameters|cleanUpUrl/.test(content)
      });
    }
  }

  /**
   * Check for UID usage in the codebase
   */
  async checkUIDUsage() {
    console.log('🔎 Checking for UID parameter usage...');

    if (this.results.uidUsages.length === 0) {
      console.log('✅ No UID parameter usage found in codebase');
      this.results.safetyScore += 30;
    } else {
      console.log(`⚠️  Found ${this.results.uidUsages.length} files with potential UID usage:`);
      this.results.uidUsages.forEach(usage => {
        console.log(`  📄 ${usage.file}`);
        usage.matches.forEach(match => {
          console.log(`     Line ${match.line}: ${match.match}`);
        });
      });
      this.results.potentialIssues.push('UID parameters found in code - review required');
    }
    console.log('');
  }

  /**
   * Verify user data handling mechanisms
   */
  async verifyUserDataHandling() {
    console.log('👤 Verifying user data handling...');

    const userDataFiles = this.results.userDataSources;

    if (userDataFiles.length > 0) {
      console.log('✅ Found user data handling in:');
      userDataFiles.forEach(source => {
        console.log(`  📄 ${source.file}`);
        console.log(`     localStorage: ${source.hasLocalStorage}`);
        console.log(`     User ID generation: ${source.hasUserIdGeneration}`);
        console.log(`     Countdown storage: ${source.hasCountdownStorage}`);
      });
      this.results.safetyScore += 25;
    } else {
      console.log('⚠️  No user data handling found');
      this.results.potentialIssues.push('No clear user data handling mechanisms found');
    }
    console.log('');
  }

  /**
   * Check URL parameter handling
   */
  async checkURLParameterHandling() {
    console.log('🌐 Checking URL parameter handling...');

    const urlHandlers = this.results.urlParameterHandlers;

    if (urlHandlers.length > 0) {
      console.log('✅ Found URL parameter handling in:');
      urlHandlers.forEach(handler => {
        console.log(`  📄 ${handler.file}`);
        console.log(`     URLSearchParams: ${handler.hasURLSearchParams}`);
        console.log(`     Location access: ${handler.hasLocationAccess}`);
        console.log(`     History API: ${handler.hasHistoryAPI}`);
        console.log(`     Custom handlers: ${handler.hasCustomURLHandlers}`);
      });
      this.results.safetyScore += 25;
    }
    console.log('');
  }

  /**
   * Generate comprehensive safety report
   */
  generateSafetyReport() {
    console.log('📊 SAFETY VERIFICATION REPORT');
    console.log('================================\n');

    // Overall safety score
    if (this.results.potentialIssues.length === 0) {
      this.results.safetyScore += 20; // Bonus for no issues
    }

    console.log(`🎯 Safety Score: ${this.results.safetyScore}/100`);

    if (this.results.safetyScore >= 95) {
      console.log('✅ SAFE TO REMOVE UID PARAMETER');
    } else if (this.results.safetyScore >= 80) {
      console.log('⚠️  PROCEED WITH CAUTION');
    } else {
      console.log('❌ NOT SAFE - REVIEW REQUIRED');
    }

    console.log('\n📈 Analysis Summary:');
    console.log(`• Files scanned: ${this.results.filesScanned}`);
    console.log(`• UID usages found: ${this.results.uidUsages.length}`);
    console.log(`• User data sources: ${this.results.userDataSources.length}`);
    console.log(`• URL handlers: ${this.results.urlParameterHandlers.length}`);
    console.log(`• Potential issues: ${this.results.potentialIssues.length}`);

    if (this.results.potentialIssues.length > 0) {
      console.log('\n⚠️  Issues to Review:');
      this.results.potentialIssues.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue}`);
      });
    }

    // Detailed recommendations
    console.log('\n💡 Recommendations:');

    if (this.results.uidUsages.length === 0) {
      console.log('✅ No UID parameter dependencies found - safe to remove');
    } else {
      console.log('⚠️  Review UID usage before removal');
    }

    if (this.results.userDataSources.some(s => s.hasLocalStorage)) {
      console.log('✅ User data is stored in localStorage - URL parameters not needed');
    }

    if (this.results.urlParameterHandlers.some(h => h.hasCustomURLHandlers)) {
      console.log('✅ Custom URL cleanup handlers exist - can be extended for UID');
    }

    console.log('\n🏁 Conclusion:');
    console.log(this.results.safetyScore >= 95
      ? '✅ Removing UID parameters is SAFE. No code dependencies found.'
      : '⚠️  Review recommended before making changes.');
  }

  /**
   * Helper: Get line number for a character index
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Helper: Get context around a match
   */
  getContext(content, index, contextLength = 50) {
    const start = Math.max(0, index - contextLength);
    const end = Math.min(content.length, index + contextLength);
    return content.substring(start, end).replace(/\n/g, ' ').trim();
  }
}

// Run verification if called directly
if (require.main === module) {
  const verifier = new UIDSafetyVerifier();
  verifier.verify()
    .then(isSafe => {
      process.exit(isSafe ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Verification failed:', error);
      process.exit(1);
    });
}

module.exports = UIDSafetyVerifier;
#!/usr/bin/env node

const { execSync } = require('child_process');

// Get the staged files
const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf-8' })
  .split('\n')
  .filter(Boolean);

// Define patterns that might need documentation updates
const patterns = {
  types: {
    pattern: /^types\/.+\.ts$/,
    docs: ['docs/technical/structured-outputs.md', 'docs/technical/database.md'],
  },
  database: {
    pattern: /^supabase\/(migrations|functions)\/.+\.(sql|ts)$/,
    docs: ['docs/technical/database.md', 'docs/technical/edge-functions.md'],
  },
  api: {
    pattern: /^app\/api\/.+\/(route|page)\.(ts|tsx)$/,
    docs: ['docs/technical/api-integration.md'],
  },
  auth: {
    pattern: /^app\/auth\/.+\/(route|page)\.(ts|tsx)$/,
    docs: ['docs/technical/authentication.md'],
  },
  insights: {
    pattern: /^app\/idea\/(insights|report)\/.+\/(route|page)\.(ts|tsx)$/,
    docs: ['docs/technical/idea-analysis.md', 'docs/technical/report-generation.md'],
  },
};

// Check each staged file against our patterns
const docsToCheck = new Set();
stagedFiles.forEach(file => {
  Object.entries(patterns).forEach(([key, { pattern, docs }]) => {
    if (pattern.test(file)) {
      docs.forEach(doc => docsToCheck.add(doc));
    }
  });
});

// If we have docs to check, print a reminder
if (docsToCheck.size > 0) {
  console.log('\n🔍 Some changes might need documentation updates!');
  console.log('\nPlease check these documentation files:');
  docsToCheck.forEach(doc => {
    console.log(`  - ${doc}`);
  });
  console.log('\nMake sure they reflect your recent changes to:');
  stagedFiles.forEach(file => {
    console.log(`  - ${file}`);
  });
  console.log(
    '\nTo proceed without updating docs, press enter. To update docs, press Ctrl+C and make your updates.\n'
  );
}

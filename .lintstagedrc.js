module.exports = {
  // Run documentation check on all staged files
  '*': ['node scripts/check-docs.js'],
  // Format and lint code files
  '*.{js,jsx,ts,tsx}': ['prettier --write', 'eslint --fix'],
  // Format documentation and config files
  '*.{json,md}': ['prettier --write'],
};

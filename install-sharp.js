// This script is used to install sharp properly in the Vercel environment
const { execSync } = require('child_process');

try {
  console.log('Installing sharp for the current platform...');
  
  // Try to install sharp with npm to ensure proper binary installation
  execSync('npm install sharp@latest --no-save', { stdio: 'inherit' });
  
  console.log('Sharp installed successfully!');
} catch (error) {
  console.error('Failed to install sharp:', error);
  process.exit(1);
} 
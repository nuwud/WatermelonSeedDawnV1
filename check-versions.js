// Run this with Node.js to check versions
const path = require('path');
const fs = require('fs');

// Find package.json
const packageJsonPath = path.resolve('./package.json');
console.log('Looking for package.json at:', packageJsonPath);

try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Check dependencies
  console.log('=== DEPENDENCIES ===');
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  // Check Three.js
  if (deps.three) {
    console.log(`Three.js version: ${deps.three}`);
  } else {
    console.log('Three.js not found in dependencies!');
  }
  
  // Check TroisJS
  if (deps.troisjs) {
    console.log(`TroisJS version: ${deps.troisjs}`);
  } else {
    console.log('TroisJS not found in dependencies!');
  }
  
  // Check Vue
  if (deps.vue) {
    console.log(`Vue version: ${deps.vue}`);
  } else {
    console.log('Vue not found in dependencies!');
  }
  
  // Compatibility check
  if (deps.three && deps.troisjs) {
    // TroisJS 0.3.x is compatible with Three.js 0.137.x-0.150.x
    const threeVersion = deps.three.replace('^', '').replace('~', '');
    const troisVersion = deps.troisjs.replace('^', '').replace('~', '');
    
    if (troisVersion.startsWith('0.3') && 
        (threeVersion.startsWith('0.137') || 
         threeVersion.startsWith('0.138') || 
         threeVersion.startsWith('0.139') || 
         threeVersion.startsWith('0.14') || 
         threeVersion.startsWith('0.15'))) {
      console.log('✅ Versions appear compatible');
    } else {
      console.log('⚠️ Potential version compatibility issue!');
      console.log('TroisJS 0.3.x works best with Three.js 0.137.x-0.150.x');
    }
  }
} catch (error) {
  console.error('Error reading package.json:', error);
}
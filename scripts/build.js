const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Determine if running from repository root or inside frontend folder
const isInsideFrontend = fs.existsSync(path.join(process.cwd(), 'vite.config.js'));
const frontendDir = isInsideFrontend ? process.cwd() : path.join(process.cwd(), 'frontend');

console.log(`📦 [Build] Execution path: ${process.cwd()}`);
console.log(`📦 [Build] Target frontend directory: ${frontendDir}`);

// Ensure frontend dependencies are installed if missing
const nodeModulesPath = path.join(frontendDir, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 [Build] Installing frontend dependencies...');
  execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });
}

// Build Vite frontend
console.log('🚀 [Build] Compiling BookMyShow production build with Vite...');
execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

console.log('✅ [Build] Build completed successfully!');

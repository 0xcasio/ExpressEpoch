const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Run the client build
console.log('Building client application...');
execSync('cd client && npm install && npm run build', { stdio: 'inherit' });

// Create dist directory at root if it doesn't exist
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Copy the client build to the root dist directory
console.log('Copying client build to root dist directory...');
const copyDir = (src, dest) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

copyDir('client/dist', 'dist');
console.log('Build completed successfully!'); 
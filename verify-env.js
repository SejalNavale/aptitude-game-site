// Verify environment configuration
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking environment files...');

// Check production environment
const prodEnv = path.join(__dirname, 'src', 'environments', 'environment.prod.ts');
if (fs.existsSync(prodEnv)) {
  const content = fs.readFileSync(prodEnv, 'utf8');
  console.log('✅ Production environment file exists');
  console.log('📄 Content:', content);
  
  if (content.includes('aptitude-game-backend1.onrender.com')) {
    console.log('✅ Correct backend URL found in production environment');
  } else {
    console.log('❌ Wrong backend URL in production environment');
  }
} else {
  console.log('❌ Production environment file not found');
}

// Check development environment
const devEnv = path.join(__dirname, 'src', 'environments', 'environment.ts');
if (fs.existsSync(devEnv)) {
  const content = fs.readFileSync(devEnv, 'utf8');
  console.log('✅ Development environment file exists');
  console.log('📄 Content:', content);
} else {
  console.log('❌ Development environment file not found');
}

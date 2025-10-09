#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Checks if the application is properly built and ready for deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying deployment readiness...\n');

// Check if build directory exists
const buildDir = path.join(__dirname, 'dist', 'aptitude-game-site');
if (!fs.existsSync(buildDir)) {
    console.log('❌ Build directory not found. Run "npm run build:prod" first.');
    process.exit(1);
}

// Check for essential files in browser subdirectory
const browserDir = path.join(buildDir, 'browser');
const essentialFiles = [
    'index.html',
    'main-',
    'polyfills-',
    'styles-'
];

let allFilesPresent = true;

if (!fs.existsSync(browserDir)) {
    console.log('❌ Browser directory not found in build output');
    allFilesPresent = false;
} else {
    const files = fs.readdirSync(browserDir);
    
    essentialFiles.forEach(file => {
        const found = files.some(f => f.includes(file));
        
        if (found) {
            console.log(`✅ Found: ${file}*`);
        } else {
            console.log(`❌ Missing: ${file}*`);
            allFilesPresent = false;
        }
    });
}

// Check backend files
const backendDir = path.join(__dirname, 'socket-server');
const backendFiles = ['package.json', 'server.js'];

console.log('\n🔍 Checking backend files...');
backendFiles.forEach(file => {
    const filePath = path.join(backendDir, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ Backend: ${file}`);
    } else {
        console.log(`❌ Backend missing: ${file}`);
        allFilesPresent = false;
    }
});

// Check environment configuration
const envFile = path.join(__dirname, 'src', 'environments', 'environment.prod.ts');
if (fs.existsSync(envFile)) {
    console.log('✅ Production environment configured');
} else {
    console.log('❌ Production environment not found');
    allFilesPresent = false;
}

console.log('\n📊 Deployment Summary:');
console.log(`Frontend build: ${fs.existsSync(buildDir) ? '✅ Ready' : '❌ Not built'}`);
console.log(`Backend files: ${backendFiles.every(f => fs.existsSync(path.join(backendDir, f))) ? '✅ Ready' : '❌ Missing files'}`);
console.log(`Environment: ${fs.existsSync(envFile) ? '✅ Configured' : '❌ Not configured'}`);

if (allFilesPresent) {
    console.log('\n🎉 Deployment verification passed!');
    console.log('\n📋 Next steps:');
    console.log('1. Deploy frontend: Upload contents of dist/aptitude-game-site/ to your static hosting');
    console.log('2. Deploy backend: Deploy socket-server/ directory to your backend hosting');
    console.log('3. Update environment URLs if needed');
    console.log('\n📖 See DEPLOYMENT.md for detailed instructions');
} else {
    console.log('\n❌ Deployment verification failed. Please fix the issues above.');
    process.exit(1);
}

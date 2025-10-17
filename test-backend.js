// Test Backend Connection
const https = require('https');

console.log('🔍 Testing backend connection...\n');

// Test current backend URL
const backendUrl = 'https://aptitude-game-backend1.onrender.com';

console.log(`Testing: ${backendUrl}`);

https.get(backendUrl, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  console.log(`✅ Headers: ${JSON.stringify(res.headers, null, 2)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`✅ Response: ${data}`);
    console.log('\n🎉 Backend is working!');
  });
}).on('error', (err) => {
  console.log(`❌ Error: ${err.message}`);
  console.log('\n🚨 Backend is NOT working!');
  console.log('\n📋 Next steps:');
  console.log('1. Deploy backend to Railway: https://railway.app');
  console.log('2. Update environment.prod.ts with new URL');
  console.log('3. Redeploy frontend');
});

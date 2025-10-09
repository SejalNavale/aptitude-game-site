// Test environment to verify build process
console.log('🔍 Environment file loaded:', new Date().toISOString());
console.log('🔍 Backend URL should be: https://aptitude-game-backend1.onrender.com');

export const environment = {
  production: true,
  apiUrl: 'https://aptitude-game-backend1.onrender.com',
  socketUrl: 'https://aptitude-game-backend1.onrender.com',
  version: '4.0.0',
  buildTime: new Date().toISOString()
};

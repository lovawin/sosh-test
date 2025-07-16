const dotenv = require('dotenv');
const path = require('path');

// Get the absolute path to the config directory
const configDir = __dirname;

if (process.env.NODE_ENV === 'development') {
  const envPath = path.join(configDir, 'dev', '.env');
  console.log('Loading development env from:', envPath);
  dotenv.config({ path: envPath });
} else {
  const envPath = path.join(configDir, 'prod', 'dev.env');
  console.log('Loading production env from:', envPath);
  dotenv.config({ path: envPath });
}

console.log('ENV ::', process.env.NODE_ENV);
console.log('tokenAddress loaded:', !!process.env.tokenAddress);
console.log('MARKETPLACE_PROXY_ADDRESS loaded:', !!process.env.MARKETPLACE_PROXY_ADDRESS);

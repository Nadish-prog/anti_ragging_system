const https = require('https');
const dotenv = require('dotenv');
dotenv.config();
const url = process.env.DATABASE_URL;
https.get(url, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Response: ', data.substring(0, 500));
  });
}).on('error', (err) => {
  console.log('Error: ', err.message);
});

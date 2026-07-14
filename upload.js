const fs = require('fs');
const https = require('https');

const projectId = '13255737167254049080';
const apiKey = process.env.GCP_API_KEY || '';
const filePath = 'd:\\lineloop\\lineloop-site\\logo.jpeg';

const fileBuffer = fs.readFileSync(filePath);
const b64Data = fileBuffer.toString('base64');

const payload = JSON.stringify({
  parent: `projects/${projectId}`,
  requests: [{
    screen: {
      screenshot: {
        fileContentBase64: b64Data,
        mimeType: 'image/jpeg'
      },
      screenType: 'IMAGE',
      isCreatedByClient: true,
      title: 'Actual Logo'
    }
  }],
  createScreenInstances: true
});

const options = {
  hostname: 'stitch.googleapis.com',
  port: 443,
  path: `/v1/projects/${projectId}/screens:batchCreate`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': apiKey,
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(data);
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.write(payload);
req.end();

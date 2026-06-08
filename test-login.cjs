const http = require('http');
const req = http.request({
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', data));
});
req.on('error', e => console.error(e));
req.write(JSON.stringify({email: 'harristotle84@gmail.com', password: 'test'}));
req.end();

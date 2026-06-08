const http = require('http');

http.get('http://127.0.0.1:3000/api/metrics', {
  headers: { 'x-user-email': 'harristotle84@gmail.com' }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Metrics:', res.statusCode, data.slice(0, 50)));
});

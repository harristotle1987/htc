const http = require('http');

const req = http.request({
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Login:', res.statusCode);
    
    // Now request leads
    http.get('http://127.0.0.1:3000/api/leads', {
      headers: { 'x-user-email': 'harristotle84@gmail.com' }
    }, res2 => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => {
        console.log('Leads:', res2.statusCode);
        if (res2.statusCode === 500) console.log(data2);
      });
    });
  });
});
req.write(JSON.stringify({email: 'harristotle84@gmail.com', password: 'Colony082987@'}));
req.end();

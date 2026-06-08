const http = require('http');

http.get('http://127.0.0.1:3000/api/users/Harristotle84@gmail.com', {
  headers: { 'x-user-email': 'Harristotle84@gmail.com' }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Users Uppercase:', res.statusCode, data));
});

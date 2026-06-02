fetch('http://localhost:3000/api/payments/harristotle84@gmail.com', {
  headers: { 'x-user-email': 'harristotle84@gmail.com' }
}).then(res => res.json()).then(console.log).catch(console.error);

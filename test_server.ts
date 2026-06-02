fetch('http://localhost:3000/api/users/harristotle84@gmail.com')
  .then(res => res.json())
  .then(console.log)
  .catch(console.error);

fetch('http://localhost:3000/api/users/harristotle84@gmail.com', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json', 'x-user-email': 'harristotle84@gmail.com' },
  body: JSON.stringify({ lastPage: 'admin' })
})
  .then(res => res.json())
  .then(console.log)
  .catch(console.error);

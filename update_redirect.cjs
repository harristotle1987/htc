const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

file = file.replace(/window\.location\.href = '\/api\/auth\/google';/g, "localStorage.removeItem('isAuthenticated'); localStorage.removeItem('tier'); window.location.reload();");

fs.writeFileSync('src/App.tsx', file, 'utf8');
console.log('App.tsx updated');

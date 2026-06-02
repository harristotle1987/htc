const fs = require('fs');
let file = fs.readFileSync('src/components/AuthModals.tsx', 'utf8');

file = file.replace(/\{type === 'login' \? 'Access Vault' : 'Claim Workspace'\}/g, "{type === 'login' ? 'Authenticate' : 'Initialize Vault'}");
file = file.replace(/\{type === 'login' \? 'Access' : 'Claim'\} Workspace/g, "{type === 'login' ? 'Authenticate' : 'Initialize Vault'}");

fs.writeFileSync('src/components/AuthModals.tsx', file, 'utf8');
console.log('AuthModals.tsx updated');

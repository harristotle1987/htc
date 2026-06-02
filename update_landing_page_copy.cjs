const fs = require('fs');
let file = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

// Replace copy
file = file.replace(/Protocol Active/g, 'Secure System');
file = file.replace(/Initialize Vault/g, 'Sign in');
file = file.replace(/Initialize/g, 'Sign Up'); // For pricing tier
file = file.replace(/Access Vault/g, 'Sign In');
file = file.replace(/View Architecture/g, 'View Features');

file = file.replace(/I do not compete\. I diagnose, then prescribe\. /g, '');
file = file.replace(/The Private Pipeline Matrix\./g, 'The Private Sales CRM.');
file = file.replace(/A security-hardened digital sanctuary engineered for elite sales architects\./g, 'A secure digital workspace built for top sales professionals.');
file = file.replace(/Absolute Privacy/g, 'Complete Privacy');
file = file.replace(/Absolute Data Hardening/g, 'Robust Data Security');

fs.writeFileSync('src/components/LandingPage.tsx', file, 'utf8');
console.log('Copy replaced.');

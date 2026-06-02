const fs = require('fs');
let file = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

// Copy updates
file = file.replace(/const \[isDark, setIsDark\] = useState\([^)]+\)/, "const [isDark, setIsDark] = useState(true)");
file = file.replace(/Access Vault/g, "Authenticate");
file = file.replace(/Sign In/g, "Authenticate");
file = file.replace(/Sign in/g, "Initialize Vault");
file = file.replace(/Sign up/g, "Initialize Vault");
file = file.replace(/Sign Up/g, "Initialize Vault");

// Tiers naming
file = file.replace(/<h3 className="[^"]+">Basic<\/h3>/, '<h3 className="text-xl font-bold uppercase tracking-wider text-foreground mb-2">Initiate</h3>');
file = file.replace(/<h3 className="[^"]+">Standard<\/h3>/, '<h3 className="text-xl font-bold uppercase tracking-wider text-foreground mb-2">Architect</h3>');
file = file.replace(/<h3 className="[^"]+">Pro<\/h3>/, '<h3 className="text-xl font-bold uppercase tracking-wider text-foreground mb-2">Syndicate</h3>');

// Modify the tier string on Success
file = file.replace(/localStorage\.setItem\('tier', 'basic'\)/g, "localStorage.setItem('tier', 'initiate')");
file = file.replace(/localStorage\.setItem\('tier', 'standard'\)/g, "localStorage.setItem('tier', 'architect')");
file = file.replace(/localStorage\.setItem\('tier', 'pro'\)/g, "localStorage.setItem('tier', 'syndicate')");

file = file.replace(/>Free tier with view-only capabilities.</, '>Free tier. Hard limit of 10 active prospects.<');
file = file.replace(/Read-only pipeline access/, 'Active Pipeline Matrix (Up to 10 limits)');

fs.writeFileSync('src/components/LandingPage.tsx', file, 'utf8');
console.log('LandingPage.tsx updated');

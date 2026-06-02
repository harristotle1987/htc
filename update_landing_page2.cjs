const fs = require('fs');
let file = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

const replacements = [
  { search: /text-black/g, replace: 'text-primary-foreground' },
  { search: /shadow-\[0_0_[\w_,\(\)\.]+\]/g, replace: 'shadow-lg shadow-primary/20' },
  { search: /hover:bg-primary/g, replace: 'hover:brightness-110' }, 
  { search: /hover:bg-card/g, replace: 'hover:brightness-110' },
  { search: /bg-card\/50\/50/g, replace: 'bg-card/50' }, // fix double /50
  { search: /bg-card\/40/g, replace: 'bg-card' },
  { search: /bg-card\/20/g, replace: 'bg-card' },
  { search: /border-zinc-900/g, replace: 'border-border' },
];

for (const {search, replace} of replacements) {
    file = file.replace(search, replace);
}

fs.writeFileSync('src/components/LandingPage.tsx', file, 'utf8');
console.log('Second pass completed.');

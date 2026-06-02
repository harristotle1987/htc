const fs = require('fs');
let file = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

const replacements = [
  { search: /bg-\[\#121111\]/g, replace: 'bg-card' },
  { search: /bg-zinc-900/g, replace: 'bg-card' },
  { search: /bg-black/g, replace: 'bg-card/50' },
  { search: /bg-amber-600/g, replace: 'bg-primary' },
  { search: /bg-amber-500/g, replace: 'bg-primary' },
  
  { search: /text-amber-500/g, replace: 'text-primary' },
  { search: /text-amber-600/g, replace: 'text-primary' },
  { search: /text-amber-400/g, replace: 'text-primary' },
  { search: /text-amber-50/g, replace: 'text-foreground' },
  { search: /text-white/g, replace: 'text-foreground' },
  { search: /text-zinc-300/g, replace: 'text-foreground/90' },
  { search: /text-zinc-400/g, replace: 'text-muted-foreground/90' },
  { search: /text-zinc-500/g, replace: 'text-muted-foreground' },
  { search: /text-zinc-600/g, replace: 'text-muted-foreground/70' },
  { search: /text-zinc-100/g, replace: 'text-foreground' },
  
  { search: /border-amber-900\/30/g, replace: 'border-border' },
  { search: /border-amber-900\/50/g, replace: 'border-primary/50' },
  { search: /border-zinc-800\/80/g, replace: 'border-border/80' },
  { search: /border-zinc-800\/50/g, replace: 'border-border/50' },
  { search: /border-zinc-800/g, replace: 'border-border' },
  { search: /border-zinc-900/g, replace: 'border-border' },
  { search: /border-zinc-700/g, replace: 'border-muted' },
  { search: /border-amber-500/g, replace: 'border-primary' },
  
  { search: /hover:bg-amber-500/g, replace: 'hover:brightness-110' },
  { search: /hover:bg-zinc-700/g, replace: 'hover:bg-muted-foreground/20' },
  { search: /hover:bg-zinc-900/g, replace: 'hover:bg-muted/50' },
  
  { search: /hover:border-amber-700\/50/g, replace: 'hover:border-primary/50' },
  { search: /hover:border-amber-500\/30/g, replace: 'hover:border-primary/50' },
  { search: /hover:text-amber-50/g, replace: 'hover:text-foreground' },
  
  { search: /from-amber-300 via-amber-500 to-amber-700/g, replace: 'from-secondary via-primary to-accent' },
  { search: /from-amber-500\/5/g, replace: 'from-primary/5' },
];

for (const {search, replace} of replacements) {
    file = file.replace(search, replace);
}

fs.writeFileSync('src/components/LandingPage.tsx', file, 'utf8');
console.log('Replacements completed.');

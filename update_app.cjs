const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

// Replace isReadOnly logic
file = file.replace(/const isReadOnly = .*/, "const isReadOnly = false; // Free tier can now edit, but limited to 10 prospects");

// Add showUpgradeModal state
if (!file.includes('showUpgradeModal')) {
    file = file.replace(/const \[tier, setTier\] = useState<string \| null>[^;]+;/, "$&\n  const [showUpgradeModal, setShowUpgradeModal] = useState(false);");
}

// Modify handleCreateLead
const oldCreate = "function handleCreateLead() {";
const newCreate = `function handleCreateLead() {
    if ((!tier || tier === 'basic' || tier === 'initiate') && leads.length >= 10) {
      setShowUpgradeModal(true);
      return;
    }`;
file = file.replace(oldCreate, newCreate);

// Add UpgradeModal import and component render
if (!file.includes('showUpgradeModal &&')) {
    file = file.replace(/<\/AnimatePresence>\n\s*<\/div>/, `</AnimatePresence>
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-card border border-border p-8 rounded-2xl max-w-md w-full relative shadow-2xl"
            >
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold uppercase tracking-widest text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Upgrade Required
              </h2>
              <p className="text-muted-foreground mb-6">
                You have reached the maximum limit of 10 active prospects on the Initiate tier. Upgrade your vault to deploy unlimited architecture.
              </p>
              <button 
                onClick={() => { setShowUpgradeModal(false); window.location.href = '/api/auth/google'; }}
                className="w-full bg-primary text-primary-foreground font-bold uppercase tracking-widest py-4 rounded hover:brightness-110 transition-all shadow-lg shadow-primary/20"
              >
                Upgrade to Architect
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>`);
    
    // add X to lucide imports if not there
    if (!file.includes(' X,')) {
      file = file.replace(/import { Moon, Sun, Plus,/, "import { Moon, Sun, Plus, X,");
    }
}

fs.writeFileSync('src/App.tsx', file, 'utf8');
console.log('App.tsx updated');

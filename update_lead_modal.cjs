const fs = require('fs');
let file = fs.readFileSync('src/components/LeadModal.tsx', 'utf8');

file = file.replace(/interface LeadModalProps \{/, 'interface LeadModalProps {\n  isReadOnly?: boolean;');
file = file.replace(/LeadModal\(\{ lead, onClose, onUpdate, onDelete \}/, 'LeadModal({ lead, onClose, onUpdate, onDelete, isReadOnly })');

// disable inputs 
file = file.replace(/<input /g, '<input disabled={isReadOnly} ');
file = file.replace(/<textarea /g, '<textarea disabled={isReadOnly} ');
file = file.replace(/<select /g, '<select disabled={isReadOnly} ');

// Hide save buttons
file = file.replace(/<button type="submit"/g, '{!isReadOnly && <button type="submit"');
file = file.replace(/>\s*Save Changes\s*<\/button>/g, '>\n                      <Save className="w-5 h-5" /> Save Changes\n                    </button>}');
file = file.replace(/<button type="button" onClick=\{onDelete\}/g, '{!isReadOnly && <button type="button" onClick={onDelete}');
file = file.replace(/>\s*Delete\s*<\/button>/g, '>\n                      <Trash2 className="w-5 h-5" /> Delete\n                    </button>}');

// Fix task list passing
file = file.replace(/TaskList tasks=\{formData.tasks \|\| \[\]\}/g, 'TaskList isReadOnly={isReadOnly} tasks={formData.tasks || []}');

fs.writeFileSync('src/components/LeadModal.tsx', file, 'utf8');
console.log('LeadModal updated');

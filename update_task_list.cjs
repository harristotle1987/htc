const fs = require('fs');
let file = fs.readFileSync('src/components/TaskList.tsx', 'utf8');

file = file.replace(/interface TaskListProps \{/, 'interface TaskListProps {\n  isReadOnly?: boolean;');
file = file.replace(/TaskList\(\{ tasks, onChange \}/, 'TaskList({ tasks, onChange, isReadOnly })');

// Disable inputs and buttons
file = file.replace(/<form /g, '{!isReadOnly && <form ');
file = file.replace(/<\/form>/g, '</form>}');

file = file.replace(/disabled=\{!newTaskTitle.trim\(\)\}/g, 'disabled={true}'); // Form is hidden entirely, but why not

file = file.replace(/onClick=\{.. \=> toggleTask\(task.id\)\}/g, 'onClick={() => !isReadOnly && toggleTask(task.id)}');
file = file.replace(/className=\{`mt-0.5 shrink-0/g, 'className={`mt-0.5 shrink-0 ${isReadOnly ? "cursor-default" : "cursor-pointer"}');

// Hide delete button
file = file.replace(/<button\n(.*)onClick=\{.. \=> setTaskToDelete\(task.id\)\}/g, '{!isReadOnly && <button\n$1onClick={() => setTaskToDelete(task.id)}');
file = file.replace(/<Trash2 className="w-3.5 h-3.5" \/>\n\s*<\/button>/g, '<Trash2 className="w-3.5 h-3.5" />\n                </button>}');

fs.writeFileSync('src/components/TaskList.tsx', file, 'utf8');
console.log('TaskList updated');

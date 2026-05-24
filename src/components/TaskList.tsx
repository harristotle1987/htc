import React, { useState } from 'react';
import { Task } from '../types';
import { Plus, Check, Trash2, Edit2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ConfirmModal from './ConfirmModal';

interface TaskListProps {
  tasks: Task[];
  onChange: (tasks: Task[]) => void;
}

export default function TaskList({ tasks, onChange }: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    onChange([
      ...tasks, 
      {
        id: `T${Date.now()}`,
        title: newTaskTitle.trim(),
        assignee: newTaskAssignee.trim(),
        dueDate: newTaskDate,
        completed: false
      }
    ]);
    
    setNewTaskTitle('');
    setNewTaskAssignee('');
    setNewTaskDate('');
  };

  const toggleTask = (id: string) => {
    onChange(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const executeDeleteTask = () => {
    if (taskToDelete) {
      onChange(tasks.filter(t => t.id !== taskToDelete));
      setTaskToDelete(null);
    }
  };

  return (
    <div className="border border-border rounded-xl bg-background/50 overflow-hidden shadow-inner">
      <div className="p-3 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between">
        <h4 className="text-[10px] font-bold tracking-widest uppercase text-muted">Follow-Up Tasks</h4>
        <div className="text-[10px] text-muted-foreground font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          {tasks.filter(t => t.completed).length}/{tasks.length}
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        <form onSubmit={handleAddTask} className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Task title..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="bg-card w-full text-sm p-2 rounded-lg border border-border focus:outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Assignee (e.g. John)"
              value={newTaskAssignee}
              onChange={(e) => setNewTaskAssignee(e.target.value)}
              className="bg-card w-1/2 text-xs p-2 rounded-lg border border-border focus:outline-none focus:border-primary"
            />
            <input
              type="date"
              value={newTaskDate}
              onChange={(e) => setNewTaskDate(e.target.value)}
              className="bg-card w-1/2 text-xs p-2 rounded-lg border border-border focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="bg-primary/20 text-primary px-3 rounded-lg hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="space-y-2">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`flex items-start justify-between gap-3 p-3 rounded-lg border transition-colors ${
                  task.completed 
                    ? 'bg-muted/5 border-border/50 opacity-60' 
                    : 'bg-card border-border hover:border-border/80'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`mt-0.5 shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      task.completed
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-muted hover:border-primary'
                    }`}
                  >
                    {task.completed && <Check className="w-3 h-3" />}
                  </button>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {task.title}
                    </span>
                    <div className="flex items-center gap-3 mt-1">
                      {task.assignee && (
                        <span className="text-[10px] uppercase tracking-wider font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
                          {task.assignee}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                          <Calendar className="w-3 h-3" /> {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setTaskToDelete(task.id)}
                  className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 p-1 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {tasks.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No tasks assigned yet.</p>
          )}
        </div>
      </div>
      <ConfirmModal
        isOpen={taskToDelete !== null}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        onConfirm={executeDeleteTask}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
}

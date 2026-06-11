import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Headset, Plus, CheckCircle, Clock, Edit3, Trash2, X, Save } from 'lucide-react';
import { useToast } from './Toast';

export default function SupportDesk({ currentUser }: { currentUser: any }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [editingTicketId, setEditingTicketId] = useState<number | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const toast = useToast();

  const fetchTickets = () => {
    setLoading(true);
    const url = currentUser?.isAdmin 
        ? '/api/support' 
        : `/api/support?email=${encodeURIComponent(currentUser?.email || '')}`;
    
    apiFetch(url)
      .then(res => res.json())
      .then(data => {
         if (data.tickets) setTickets(data.tickets);
         setLoading(false);
      })
      .catch(err => {
         console.error(err);
         setLoading(false);
      });
  };

  useEffect(() => {
    fetchTickets();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return toast('Please fill all fields');
    
    try {
       const res = await apiFetch('/api/support', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: currentUser.email,
            subject,
            message
          })
       });
       if (!res.ok) throw new Error('Failed');
       toast('Ticket submitted successfully');
       setShowForm(false);
       setSubject('');
       setMessage('');
       fetchTickets();
    } catch(err) {
       toast('Failed to submit ticket');
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
        const res = await apiFetch(`/api/admin/support/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (!res.ok) throw new Error('Failed');
        toast(`Ticket set to ${status}`);
        fetchTickets();
    } catch (err) {
        toast('Failed to update ticket');
    }
  };

  const startEdit = (ticket: any) => {
    setEditingTicketId(ticket.id);
    setEditSubject(ticket.subject);
    setEditMessage(ticket.message);
  };

  const cancelEdit = () => {
    setEditingTicketId(null);
    setEditSubject('');
    setEditMessage('');
  };

  const handleUpdate = async (id: number) => {
    if (!editSubject || !editMessage) return toast('Fields cannot be empty');
    try {
      const res = await apiFetch(`/api/support/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: editSubject, message: editMessage, userEmail: currentUser.email })
      });
      if (!res.ok) throw new Error('Failed');
      toast('Ticket updated');
      cancelEdit();
      fetchTickets();
    } catch (err) {
      toast('Failed to update ticket');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    try {
      const res = await apiFetch(`/api/support/${id}?email=${encodeURIComponent(currentUser.email)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed');
      toast('Ticket deleted');
      fetchTickets();
    } catch (err) {
      toast('Failed to delete ticket');
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 relative z-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight mb-2">Help & Support</h1>
          <p className="text-muted-foreground">Manage support tickets and feedback.</p>
        </div>
        {!currentUser?.isAdmin && !showForm && (
          <button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs py-3 px-6 rounded-xl hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2">
            <Plus size={16} /> New Support Ticket
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-6 md:p-10 shadow-xl max-w-2xl">
          <h2 className="text-2xl font-display font-bold mb-6">Create Support Ticket</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Subject</label>
              <input 
                 type="text" 
                 value={subject} 
                 onChange={e => setSubject(e.target.value)} 
                 className="w-full bg-background border border-border rounded-xl p-3 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                 placeholder="e.g. Cannot access dashboard"
                 required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Message</label>
              <textarea 
                 value={message} 
                 onChange={e => setMessage(e.target.value)} 
                 className="w-full bg-background border border-border rounded-xl p-3 h-32 focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                 placeholder="Describe your issue in detail..."
                 required
              />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="flex-1 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs py-3 rounded-xl hover:brightness-110 transition">
                Submit Ticket
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-background border border-border font-bold uppercase tracking-widest text-xs py-3 rounded-xl hover:bg-card/50 transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-4 md:p-8 shadow-xl">
           {loading ? (
             <div className="text-center py-10 text-muted-foreground uppercase text-xs font-bold tracking-widest">Loading Tickets...</div>
           ) : tickets.length === 0 ? (
             <div className="text-center py-16 flex flex-col items-center">
                 <Headset className="w-16 h-16 text-muted border border-border rounded-full p-4 mb-4" />
                 <h3 className="text-xl font-bold mb-2">No Support Tickets</h3>
                 <p className="text-muted-foreground">Everything looks clear.</p>
             </div>
           ) : (
             <div className="space-y-4">
                 {tickets.map(ticket => (
                    <div key={ticket.id} className="bg-background/50 border border-border rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                             {ticket.status === 'open' ? (
                                <span className="bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded flex items-center gap-1"><Clock size={14} /> Open</span>
                             ) : (
                                <span className="bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded flex items-center gap-1"><CheckCircle size={14} /> Closed</span>
                             )}
                             <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Ticket #{ticket.id}</span>
                             <span className="text-xs text-muted-foreground font-mono">{new Date(ticket.created_at).toLocaleDateString()}</span>
                          </div>
                          
                          {editingTicketId === ticket.id ? (
                            <div className="space-y-3 mt-4">
                              <input 
                                type="text"
                                value={editSubject}
                                onChange={e => setEditSubject(e.target.value)}
                                className="w-full bg-background border border-primary/50 rounded-lg p-2 text-foreground font-bold focus:ring-1 focus:ring-primary"
                              />
                              <textarea 
                                value={editMessage}
                                onChange={e => setEditMessage(e.target.value)}
                                className="w-full bg-background border border-primary/50 rounded-lg p-2 text-foreground h-24 resize-none focus:ring-1 focus:ring-primary"
                              />
                              <div className="flex gap-2">
                                <button onClick={() => handleUpdate(ticket.id)} className="bg-primary/20 text-primary hover:bg-primary/30 flex items-center gap-1 font-bold px-3 py-1.5 rounded-lg text-xs transition">
                                  <Save size={14} /> Save
                                </button>
                                <button onClick={cancelEdit} className="bg-muted text-muted-foreground hover:bg-muted/80 flex items-center gap-1 font-bold px-3 py-1.5 rounded-lg text-xs transition">
                                  <X size={14} /> Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h3 className="text-lg font-bold">{ticket.subject}</h3>
                              <p className="text-muted-foreground mt-2">{ticket.message}</p>
                            </>
                          )}

                          {currentUser?.isAdmin && <div className="mt-3 text-xs text-muted font-mono bg-border/50 inline-block px-2 py-1 rounded">Sender: {ticket.user_email}</div>}
                       </div>
                       
                       <div className="flex flex-col gap-2 shrink-0">
                         {editingTicketId !== ticket.id && !currentUser?.isAdmin && (
                           <div className="flex items-center gap-2 self-end mb-2">
                             <button onClick={() => startEdit(ticket)} title="Edit Ticket" className="text-blue-500 hover:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 p-2 rounded-lg transition">
                               <Edit3 size={18} />
                             </button>
                             <button onClick={() => handleDelete(ticket.id)} title="Delete Ticket" className="text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 p-2 rounded-lg transition">
                               <Trash2 size={18} />
                             </button>
                           </div>
                         )}

                         {currentUser?.isAdmin && ticket.status === 'open' && (
                            <button onClick={() => updateStatus(ticket.id, 'closed')} className="bg-background border border-border hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-500 transition px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest shrink-0">
                               Mark as Closed
                            </button>
                         )}
                         {currentUser?.isAdmin && ticket.status === 'closed' && (
                            <button onClick={() => updateStatus(ticket.id, 'open')} className="bg-background border border-border hover:bg-amber-500/10 hover:border-amber-500/50 hover:text-amber-500 transition px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest shrink-0">
                               Reopen Ticket
                            </button>
                         )}
                       </div>
                    </div>
                 ))}
             </div>
           )}
        </div>
      )}
    </>
  );
}

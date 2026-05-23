import React, { useState, useEffect } from 'react';
import ActivityLogs from './ActivityLogs';

export default function AdminPanel({ socket }: { socket: any }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data.users);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return <div className="p-8">Loading users...</div>;

  return (
    <div className="w-full p-4 md:p-8">
      <div className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-4 md:p-8 shadow-xl">
        <h2 className="text-3xl font-display font-bold tracking-tight mb-6">User Management</h2>
        <div className="overflow-auto border border-white/10 rounded-xl bg-background/50 backdrop-blur-sm shadow-inner">
          <table className="w-full text-left text-sm">
            <thead className="bg-card/80 text-muted uppercase tracking-widest text-xs sticky top-0 z-10 backdrop-blur-md border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Phone</th>
                <th className="px-6 py-4 font-semibold">Subscription</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 capitalize">{u.name}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">{u.phone || 'N/A'}</td>
                  <td className="px-6 py-4 capitalize">{u.subscription || 'free'}</td>
                  <td className="px-6 py-4">{u.signupDate ? new Date(u.signupDate).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ActivityLogs socket={socket} />
    </div>
  );
}

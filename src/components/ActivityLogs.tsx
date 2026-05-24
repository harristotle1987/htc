import React, { useState, useEffect } from 'react';

export default function ActivityLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/logs')
      .then(res => res.json())
      .then(data => {
        setLogs(data.logs || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading logs...</div>;

  return (
    <div className="w-full bg-card/60 backdrop-blur-md border border-border rounded-2xl p-4 md:p-8 shadow-xl mt-8">
      <h2 className="text-3xl font-display font-bold tracking-tight mb-6">Activity Logs</h2>
      <div className="overflow-auto border border-white/10 rounded-xl bg-background/50 backdrop-blur-sm shadow-inner max-h-[400px]">
        <table className="w-full text-left text-sm">
          <thead className="bg-card/80 text-muted uppercase tracking-widest text-xs sticky top-0 z-10 backdrop-blur-md border-b border-white/10">
            <tr>
              <th className="px-6 py-4 font-semibold">User</th>
              <th className="px-6 py-4 font-semibold">Action</th>
              <th className="px-6 py-4 font-semibold">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((log, i) => (
              <tr key={i}>
                <td className="px-6 py-4">{log.user_email || 'System'}</td>
                <td className="px-6 py-4">{log.action}</td>
                <td className="px-6 py-4">{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { apiFetch } from "../lib/api";
import React, { useEffect, useState } from 'react';

interface User {
  email: string;
  name: string;
  phone: string;
  subscription: string;
  signupDate: string;
}

export default function AdminTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-zinc-500">Loading users...</div>;

  return (
    <div className="bg-[#121111] border border-zinc-800 rounded-2xl p-6">
      <h3 className="text-xl font-bold mb-6 text-zinc-100">User Dashboard</h3>
      <table className="w-full text-left text-zinc-400">
        <thead className="border-b border-zinc-800">
          <tr>
            <th className="pb-3 text-zinc-100">Name</th>
            <th className="pb-3 text-zinc-100">Email</th>
            <th className="pb-3 text-zinc-100">Subscription</th>
            <th className="pb-3 text-zinc-100">Signup Date</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, i) => (
            <tr key={i} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-900 transition-colors">
              <td className="py-4 text-zinc-100">{user.name}</td>
              <td className="py-4">{user.email}</td>
              <td className="py-4 capitalize">{user.subscription}</td>
              <td className="py-4">{new Date(user.signupDate).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

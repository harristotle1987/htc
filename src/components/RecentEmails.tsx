import React, { useState, useEffect } from 'react';
import { Mail, Loader2, ExternalLink } from 'lucide-react';
import { getAccessToken } from '../lib/firebase';

interface RecentEmailsProps {
  query: string;
}

export default function RecentEmails({ query }: RecentEmailsProps) {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }
    fetchEmails();
  }, [query]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError('');
      const token = await getAccessToken();
      if (!token) {
        setError('Workspace not connected');
        setLoading(false);
        return;
      }

      // Search Gmail for query
      const searchRes = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=3`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const searchData = await searchRes.json();

      if (!searchData.messages) {
        setEmails([]);
        setLoading(false);
        return;
      }

      // Fetch details for each message
      const messages = await Promise.all(
        searchData.messages.map(async (msg: any) => {
          const detailRes = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          return await detailRes.json();
        })
      );

      const parsedEmails = messages.map(msg => {
        const headers = msg.payload?.headers || [];
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
        const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender';
        const date = headers.find((h: any) => h.name === 'Date')?.value || '';
        
        return {
          id: msg.id,
          snippet: msg.snippet,
          subject,
          from: from.replace(/<.*>/, '').trim(),
          date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        };
      });

      setEmails(parsedEmails);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 border border-border rounded-xl bg-background/50">
        <Loader2 className="w-5 h-5 text-muted animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-border rounded-xl bg-background/50 text-xs text-muted-foreground">
        <Mail className="w-4 h-4 mb-2 opacity-50" />
        {error}
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="p-4 border border-border rounded-xl bg-background/50 text-xs text-muted-foreground">
        <Mail className="w-4 h-4 mb-2 opacity-50" />
        No recent emails found for "{query}".
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl bg-background/50 overflow-hidden shadow-inner">
      <div className="p-3 border-b border-border bg-card/80 backdrop-blur-md flex items-center gap-2">
        <Mail className="w-4 h-4 text-primary-blue" />
        <h4 className="text-[10px] font-bold tracking-widest uppercase text-muted">Recent Correspondence</h4>
      </div>
      <div className="divide-y divide-border">
        {emails.map((email, i) => (
          <a 
            key={i} 
            href={`https://mail.google.com/mail/u/0/#inbox/${email.id}`} 
            target="_blank" 
            rel="noreferrer"
            className="block p-4 hover:bg-white/[0.02] transition-colors group"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1 flex-1 pr-2">{email.subject}</span>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap pt-1 shrink-0">{email.date}</span>
            </div>
            <div className="text-xs text-muted font-medium mb-1">{email.from}</div>
            <div className="text-xs text-muted-foreground line-clamp-2 truncate">{email.snippet}</div>
          </a>
        ))}
      </div>
    </div>
  );
}

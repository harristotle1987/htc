import React, { useState, useEffect } from 'react';
import Cal, { getCalApi } from '@calcom/embed-react';
import { Calendar, Settings } from 'lucide-react';

export default function SchedulingBoard() {
  const [calUrl, setCalUrl] = useState(() => localStorage.getItem('calcom_url') || '');
  const [isEditing, setIsEditing] = useState(!calUrl);
  const [tempUrl, setTempUrl] = useState(calUrl);

  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal("ui", {"styles":{"branding":{"brandColor":"#000000"}},"hideEventTypeDetails":false,"layout":"month_view"});
    })();
  }, []);

  const saveUrl = () => {
    const formattedUrl = tempUrl.replace(/^(https?:\/\/)?(www\.)?cal\.com\//, '');
    setCalUrl(formattedUrl);
    localStorage.setItem('calcom_url', formattedUrl);
    setIsEditing(false);
  };

  return (
    <div className="flex-1 w-full flex flex-col h-full bg-card/50 rounded-3xl overflow-hidden border border-border">
      <div className="p-6 md:p-8 flex items-center justify-between border-b border-border bg-card z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/20 text-primary flex items-center justify-center rounded-2xl">
            <Calendar size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Scheduling & Calls</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              Manage your calls and show ups
            </p>
          </div>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-muted/50 rounded-full text-muted-foreground transition-colors mr-1">
            <Settings size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-6">
        {isEditing ? (
          <div className="max-w-xl mx-auto mt-12 bg-card border border-border p-8 rounded-3xl space-y-6 shadow-xl shadow-black/5">
            <div className="flex items-center gap-3 text-primary mb-2">
              <Calendar className="w-6 h-6" />
              <h2 className="text-xl font-bold">Configure Cal.com</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              Enter your Cal.com scheduling link (e.g., cal.com/username/15min) to embed your calendar directly into your vault.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Cal.com Link</label>
                <input 
                  type="text" 
                  placeholder="https://cal.com/your-username"
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground"
                  value={tempUrl}
                  onChange={e => setTempUrl(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={saveUrl}
                  disabled={!tempUrl}
                  className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl text-sm transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Integration
                </button>
                {calUrl && (
                  <button 
                    onClick={() => { setIsEditing(false); setTempUrl(calUrl); }}
                    className="px-6 py-3 bg-transparent border border-border text-foreground font-bold rounded-xl text-sm transition-all hover:bg-muted/50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full min-h-[600px] bg-background rounded-2xl overflow-hidden border border-border relative">
            <Cal 
              calLink={calUrl} 
              style={{ width: '100%', height: '100%', overflow: 'scroll' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

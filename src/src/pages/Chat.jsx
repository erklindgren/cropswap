import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { Empty, TrustPill } from '../components/UI';
import { SectionHeader } from '../components/UI';

// Simple in-memory chat using Supabase Realtime broadcast
// For production, add a messages table   this prototype uses broadcast channels

function ChatWindow({ thread, currentUser, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [channel, setChannel] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    // Create a private channel between the two users
    const channelName = [currentUser.id, thread.user_id].sort().join('_');
    const ch = supabase.channel(`chat:${channelName}`, {
      config: { broadcast: { self: true } }
    });

    ch.on('broadcast', { event: 'message' }, ({ payload }) => {
      setMessages(prev => [...prev, payload]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }).subscribe();

    setChannel(ch);
    return () => supabase.removeChannel(ch);
  }, [thread.user_id, currentUser.id]);

  const send = async () => {
    if (!input.trim() || !channel) return;
    const msg = {
      id:         Date.now(),
      sender_id:  currentUser.id,
      sender:     currentUser.display_name,
      text:       input.trim(),
      created_at: new Date().toISOString(),
    };
    await channel.send({ type:'broadcast', event:'message', payload: msg });
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="btn-ghost p-2"><ArrowLeft size={16} /></button>
        <div>
          <div className="font-medium text-stone-800">{thread.display_name}</div>
          <div className="text-xs text-stone-400">{thread.context || 'Direct message'}</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle size={32} className="text-stone-200 mb-3" />
            <p className="text-stone-400 text-sm">No messages yet.<br />Say hello to get started.</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender_id === currentUser.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe ? 'bg-moss-600 text-white rounded-tr-sm' : 'bg-stone-100 text-stone-800 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Note about persistence */}
      <div className="text-xs text-stone-300 text-center mb-2">
        Messages are session-only in this version   they don't persist after you leave.
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Type a message…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button onClick={send} className="btn-primary px-4">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

export default function Chat() {
  const { user, tradeRequests } = useApp();
  const [activeThread, setActiveThread] = useState(null);

  // Build thread list from trade partners
  const partners = {};
  (tradeRequests || []).forEach(t => {
    const isRequester = t.requester_id === user?.id;
    const partnerId   = isRequester ? t.listing_owner_id : t.requester_id;
    const partnerName = isRequester ? (t.listing_owner_name || 'Grower') : (t.requester_name || 'Member');
    if (!partners[partnerId]) {
      partners[partnerId] = {
        user_id:      partnerId,
        display_name: partnerName,
        context:      `Re: ${t.listings?.crop || 'trade'}`,
      };
    }
  });

  const threads = Object.values(partners);

  if (activeThread) {
    return (
      <div className="page-enter">
        <ChatWindow thread={activeThread} currentUser={user} onBack={() => setActiveThread(null)} />
      </div>
    );
  }

  return (
    <div className="page-enter">
      <SectionHeader title="Messages" subtitle="Chat with trade partners" />

      {threads.length === 0 ? (
        <Empty emoji="💬" title="No conversations yet"
          body="Message threads appear here once you have pending or confirmed trades." />
      ) : (
        <div className="flex flex-col gap-2">
          {threads.map(t => (
            <button key={t.user_id} onClick={() => setActiveThread(t)}
              className="card p-4 flex items-center gap-3 text-left hover:shadow-lift transition-shadow">
              <div className="w-10 h-10 rounded-full bg-moss-100 flex items-center justify-center font-medium text-moss-700 flex-shrink-0">
                {t.display_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-stone-800">{t.display_name}</div>
                <div className="text-xs text-stone-400 mt-0.5 truncate">{t.context}</div>
              </div>
              <MessageCircle size={16} className="text-stone-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

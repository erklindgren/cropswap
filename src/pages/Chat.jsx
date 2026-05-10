import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, ArrowLeft, Users, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { Empty, SectionHeader } from '../components/UI';

function MessageBubble({ msg, isMe }) {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
      {!isMe && (
        <div className="w-6 h-6 rounded-full bg-moss-100 flex items-center justify-center text-xs font-medium text-moss-700 mr-2 flex-shrink-0 mt-1">
          {(msg.sender || '?').charAt(0).toUpperCase()}
        </div>
      )}
      <div className={`max-w-xs lg:max-w-sm ${isMe ? '' : ''}`}>
        {!isMe && <div className="text-xs text-stone-400 mb-1 ml-1">{msg.sender}</div>}
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isMe ? 'bg-moss-600 text-white rounded-tr-sm' : 'bg-stone-100 text-stone-800 rounded-tl-sm'
        }`}>
          {msg.text}
        </div>
        <div className={`text-xs text-stone-300 mt-1 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
          {new Date(msg.created_at).toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' })}
        </div>
      </div>
    </div>
  );
}

function ChatWindow({ channelName, title, subtitle, currentUser, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [channel, setChannel]   = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const ch = supabase.channel(channelName, {
      config: { broadcast: { self: true } }
    });
    ch.on('broadcast', { event: 'message' }, ({ payload }) => {
      setMessages(prev => [...prev, payload]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }).subscribe();
    setChannel(ch);
    return () => supabase.removeChannel(ch);
  }, [channelName]);

  const send = async () => {
    if (!input.trim() || !channel) return;
    const msg = {
      id:         `${Date.now()}-${Math.random()}`,
      sender_id:  currentUser.id,
      sender:     currentUser.display_name,
      text:       input.trim(),
      created_at: new Date().toISOString(),
    };
    await channel.send({ type:'broadcast', event:'message', payload: msg });
    setInput('');
  };

  return (
    <div className="flex flex-col" style={{ height:'calc(100vh - 9rem)' }}>
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <button onClick={onBack} className="btn-ghost p-2"><ArrowLeft size={16} /></button>
        <div className="flex-1">
          <div className="font-medium text-stone-800">{title}</div>
          <div className="text-xs text-stone-400">{subtitle}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <MessageCircle size={32} className="text-stone-200 mb-3" />
            <p className="text-stone-400 text-sm">No messages yet. Say hello.</p>
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} isMe={msg.sender_id === currentUser.id} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="text-xs text-stone-300 text-center py-1 flex-shrink-0">
        Messages are live but not stored between sessions
      </div>

      <div className="flex gap-2 pt-2 flex-shrink-0">
        <input
          className="input flex-1"
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
        />
        <button onClick={send} className="btn-primary px-4 flex-shrink-0">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

export default function Chat() {
  const { user, tradeRequests } = useApp();
  const [activeChannel, setActiveChannel] = useState(null);

  // Build private trade threads
  const tradeThreads = [];
  const seen = new Set();
  (tradeRequests || []).forEach(t => {
    const isRequester    = t.requester_id === user?.id;
    const partnerId      = isRequester ? t.listing_owner_id : t.requester_id;
    const partnerName    = isRequester ? 'Listing owner' : 'Requester';
    const channelName    = `trade:${[user?.id, partnerId].sort().join('_')}`;
    if (!seen.has(channelName)) {
      seen.add(channelName);
      tradeThreads.push({
        channelName,
        title: partnerName,
        subtitle: `Private trade chat`,
        type: 'private',
      });
    }
  });

  if (activeChannel) {
    return (
      <div className="page-enter">
        <ChatWindow
          channelName={activeChannel.channelName}
          title={activeChannel.title}
          subtitle={activeChannel.subtitle}
          currentUser={user}
          onBack={() => setActiveChannel(null)}
        />
      </div>
    );
  }

  return (
    <div className="page-enter">
      <SectionHeader title="Chat" subtitle="Community and trade conversations" />

      {/* Community chat */}
      <div className="mb-4">
        <div className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">Community</div>
        <button
          onClick={() => setActiveChannel({ channelName:'community:duluth', title:'Duluth Crop Swap', subtitle:'Open community chat', type:'community' })}
          className="card p-4 flex items-center gap-3 w-full text-left hover:shadow-lift transition-shadow">
          <div className="w-10 h-10 rounded-full bg-moss-100 flex items-center justify-center flex-shrink-0">
            <Users size={18} className="text-moss-600" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-stone-800">Duluth Community Chat</div>
            <div className="text-xs text-stone-400">Open to all members</div>
          </div>
          <MessageCircle size={16} className="text-stone-300" />
        </button>
      </div>

      {/* Private trade threads */}
      <div>
        <div className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">Trade chats</div>
        {tradeThreads.length === 0 ? (
          <Empty emoji="🔒" title="No trade chats yet"
            body="Private chats appear here when you have pending or confirmed trades." />
        ) : (
          <div className="flex flex-col gap-2">
            {tradeThreads.map(t => (
              <button key={t.channelName} onClick={() => setActiveChannel(t)}
                className="card p-4 flex items-center gap-3 text-left hover:shadow-lift transition-shadow w-full">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                  <Lock size={16} className="text-stone-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-stone-800">{t.title}</div>
                  <div className="text-xs text-stone-400">{t.subtitle}</div>
                </div>
                <MessageCircle size={16} className="text-stone-300" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

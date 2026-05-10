import { createPortal } from 'react-dom';
import { Share2, Copy, X, Check } from 'lucide-react';
import { useState } from 'react';

export function ShareTradeModal({ trade, onClose }) {
  const [copied, setCopied] = useState(false);
  const url  = `https://cropswap.uppfinna.com`;
  const text = `I just completed a garden produce swap on Duluth Crop Swap! No money, just neighbors sharing abundance. Join us at`;
  const twitterUrl  = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = () => {
    if (navigator.share) {
      navigator.share({ title:'Duluth Crop Swap', text, url });
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-lift w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-stone-800">Share your trade</h2>
          <button onClick={onClose} className="btn-ghost p-2"><X size={18} /></button>
        </div>

        <div className="bg-moss-50 border border-moss-100 rounded-xl p-3 mb-5 text-sm text-moss-700 leading-relaxed">
          {text} {url}
        </div>

        <div className="flex flex-col gap-2">
          {navigator.share && (
            <button onClick={nativeShare}
              className="btn-primary flex items-center justify-center gap-2">
              <Share2 size={16} /> Share
            </button>
          )}
          <a href={twitterUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white font-medium text-sm hover:bg-black transition-colors">
            Share on X / Twitter
          </a>
          <a href={facebookUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors">
            Share on Facebook
          </a>
          <button onClick={copyLink}
            className="flex items-center justify-center gap-2 btn-secondary">
            {copied ? <><Check size={16} className="text-moss-600" /> Copied!</> : <><Copy size={16} /> Copy link</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

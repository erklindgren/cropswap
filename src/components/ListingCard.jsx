import { useState } from 'react';
import { MapPin, Star, Flame, Heart, ArrowRightLeft } from 'lucide-react';
import { TierBadge, CreditBadge, FreshnessDot, TrustPill, Modal } from './UI';
import { useApp } from '../context/AppContext';

// ── Crop photo placeholder ────────────────────────────────────────────────────
function CropPhoto({ color, emoji, size = 'md' }) {
  const sizes = { sm: 'w-14 h-14 text-2xl', md: 'w-20 h-20 text-3xl', lg: 'w-28 h-28 text-4xl' };
  return (
    <div className={`${sizes[size]} rounded-xl flex items-center justify-center flex-shrink-0`}
      style={{ backgroundColor: color + '22', border: `1px solid ${color}33` }}>
      <span>{emoji}</span>
    </div>
  );
}

// ── Trade request modal ───────────────────────────────────────────────────────
function TradeModal({ listing, onClose }) {
  const { user, requestTrade, notify } = useApp();
  const [offerText, setOffer] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!offerText.trim()) { notify('Describe what you\'re offering.', 'warning'); return; }
    requestTrade(listing, offerText);
    onClose();
  };

  return (
    <Modal title="Request a Trade" onClose={onClose}>
      {/* What they're offering */}
      <div className="bg-stone-50 rounded-2xl p-4 mb-4">
        <div className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">They're offering</div>
        <div className="flex items-center gap-3">
          <CropPhoto color={listing.photo_color} emoji={listing.photo_emoji} size="sm" />
          <div>
            <div className="font-medium text-stone-800">{listing.variety ? `${listing.crop} — ${listing.variety}` : listing.crop}</div>
            <div className="text-stone-500 text-sm">{listing.quantity} {listing.unit} · {listing.user_name}</div>
            <div className="mt-1"><CreditBadge amount={listing.credits} size="sm" /></div>
          </div>
        </div>
      </div>

      {/* What you're offering */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Your offer</label>
        <input className="input" placeholder="e.g. 2 bunches lemon balm (20 credits)" value={offerText} onChange={e => setOffer(e.target.value)} />
        <p className="text-xs text-stone-400 mt-1.5">Describe what you'll bring. Values should roughly match.</p>
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Message <span className="text-stone-400 font-normal">(optional)</span></label>
        <textarea className="input min-h-[80px] resize-none" placeholder="Add a note to the grower…" value={message} onChange={e => setMessage(e.target.value)} />
      </div>

      {/* LETS note */}
      <div className="bg-moss-50 border border-moss-100 rounded-xl p-3 mb-5 text-xs text-moss-700">
        Credits are held in escrow until pickup is confirmed by QR scan. If pickup doesn't happen within 48 hours, credits return automatically.
      </div>

      <div className="flex gap-3">
        <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button onClick={handleSubmit} className="btn-primary flex-1 flex items-center justify-center gap-2">
          <ArrowRightLeft size={15} /> Send Request
        </button>
      </div>
    </Modal>
  );
}

// ── Listing card ──────────────────────────────────────────────────────────────
export function ListingCard({ listing, view = 'grid' }) {
  const { user, wishlists, toggleWishlist } = useApp();
  const [showTrade, setShowTrade] = useState(false);
  const isWishlisted = wishlists.includes(listing.crop);
  const isOwn = listing.user_id === user?.id;

  if (view === 'list') {
    return (
      <>
        <div className="card p-4 flex items-center gap-4 hover:shadow-lift transition-shadow duration-200">
          <CropPhoto color={listing.photo_color} emoji={listing.photo_emoji} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-medium text-stone-800 leading-tight">{listing.crop}</div>
                {listing.variety && <div className="text-xs text-stone-500 italic">{listing.variety}</div>}
              </div>
              <CreditBadge amount={listing.credits} size="sm" />
            </div>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <TierBadge tier={parseInt(listing.credit_tier || listing.tier)} />
              <FreshnessDot bestBy={listing.best_by} />
              <span className="text-xs text-stone-400 flex items-center gap-1"><MapPin size={10} />{listing.distance} mi</span>
              {listing.high_demand && <span className="tag tag-demand flex items-center gap-1"><Flame size={10} /> High Demand</span>}
            </div>
          </div>
          {!isOwn && (
            <button onClick={() => setShowTrade(true)} className="btn-primary text-sm px-4 py-2 whitespace-nowrap">Request</button>
          )}
        </div>
        {showTrade && <TradeModal listing={listing} onClose={() => setShowTrade(false)} />}
      </>
    );
  }

  return (
    <>
      <div className="card p-4 flex flex-col gap-3 hover:shadow-lift transition-shadow duration-200 group">
        <div className="flex items-start justify-between">
          <CropPhoto color={listing.photo_color} emoji={listing.photo_emoji} size="md" />
          <button onClick={() => toggleWishlist(listing.crop)}
            className={`p-1.5 rounded-lg transition-colors ${isWishlisted ? 'text-clay-500' : 'text-stone-300 hover:text-stone-400'}`}>
            <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div>
          <div className="font-medium text-stone-800 leading-snug">{listing.crop}</div>
          {listing.variety && <div className="text-xs text-stone-400 italic mt-0.5">{listing.variety}</div>}
          <p className="text-stone-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">{listing.description}</p>
        </div>

        <div className="flex flex-wrap gap-1.5 items-center">
          <TierBadge tier={parseInt(listing.credit_tier || listing.tier)} />
          <FreshnessDot bestBy={listing.best_by} />
          {listing.surplus && <span className="tag bg-soil-50 text-soil-600 border border-soil-100">Take It All</span>}
          {listing.high_demand && <span className="tag tag-demand flex items-center gap-1"><Flame size={10} /> Demand</span>}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-stone-50">
          <div>
            <div className="flex items-center gap-1 text-xs text-stone-500">
              <span className="font-medium text-stone-700">{listing.user_name}</span>
              <TrustPill tier={listing.grower_tier || listing.user_tier} />
            </div>
            <div className="flex items-center gap-1 text-xs text-stone-400 mt-0.5">
              <MapPin size={10} />{listing.distance} mi · {listing.quantity} {listing.unit}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CreditBadge amount={listing.credits} size="sm" />
            {!isOwn && (
              <button onClick={() => setShowTrade(true)} className="btn-primary text-sm px-3 py-1.5">
                Request
              </button>
            )}
          </div>
        </div>
      </div>
      {showTrade && <TradeModal listing={listing} onClose={() => setShowTrade(false)} />}
    </>
  );
}

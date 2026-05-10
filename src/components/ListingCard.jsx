import { useState } from 'react';
import { MapPin, Heart, ArrowRightLeft, X, Flame, Package } from 'lucide-react';
import { TierBadge, CreditBadge, FreshnessDot, TrustPill, Modal, CropPhoto, getCropEmoji } from './UI';
import { useApp } from '../context/AppContext';

// ── Trade request modal ───────────────────────────────────────────────────────
function TradeModal({ listing, onClose }) {
  const { user, requestTrade, notify } = useApp();
  const [offerText, setOffer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!offerText.trim()) { notify('Describe what you\'re offering.', 'warning'); return; }
    setLoading(true);
    await requestTrade(listing, offerText);
    setLoading(false);
    onClose();
  };

  return (
    <Modal title="Request a Trade" onClose={onClose}>
      <div className="bg-stone-50 rounded-2xl p-4 mb-4 flex items-center gap-3">
        <CropPhoto listing={listing} size="sm" />
        <div>
          <div className="font-medium text-stone-800">{listing.variety ? `${listing.crop} — ${listing.variety}` : listing.crop}</div>
          <div className="text-stone-500 text-sm">{listing.quantity} {listing.unit} · {listing.grower_name || listing.user_name}</div>
          <div className="mt-1"><CreditBadge amount={listing.credits} size="sm" /></div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Your offer *</label>
        <input className="input" placeholder="e.g. 2 bunches lemon balm (20 credits)"
          value={offerText} onChange={e => setOffer(e.target.value)} />
        <p className="text-xs text-stone-400 mt-1.5">Describe what you'll bring. Values should roughly match.</p>
      </div>

      <div className="bg-moss-50 border border-moss-100 rounded-xl p-3 mb-5 text-xs text-moss-700 leading-relaxed">
        Credits are held in escrow until pickup is confirmed by QR scan. If pickup doesn't happen within 48 hours, credits return automatically.
      </div>

      <div className="flex gap-3">
        <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button onClick={handleSubmit} disabled={loading}
          className="btn-primary flex-1 flex items-center justify-center gap-2">
          {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><ArrowRightLeft size={15} /> Send Request</>}
        </button>
      </div>
    </Modal>
  );
}

// ── Listing detail modal ──────────────────────────────────────────────────────
function ListingDetailModal({ listing, onClose }) {
  const { user, wishlists, toggleWishlist } = useApp();
  const [showTrade, setShowTrade] = useState(false);
  const isOwn = listing.user_id === user?.id;
  const isWishlisted = wishlists.includes(listing.crop);

  return (
    <>
      <Modal title={listing.crop} onClose={onClose} wide>
        <div className="flex gap-4 mb-5">
          <CropPhoto listing={listing} size="lg" />
          <div className="flex-1 min-w-0">
            {listing.variety && <div className="text-stone-400 italic text-sm mb-1">{listing.variety}</div>}
            <div className="flex flex-wrap gap-1.5 mb-2">
              <TierBadge tier={parseInt(listing.credit_tier || listing.tier)} />
              {listing.best_by && <FreshnessDot bestBy={listing.best_by} />}
              {listing.surplus && <span className="tag bg-soil-50 text-soil-600 border border-soil-100">Take It All</span>}
              {listing.high_demand && <span className="tag tag-demand flex items-center gap-1"><Flame size={10} /> High Demand</span>}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-stone-700 text-sm">{listing.grower_name || listing.user_name}</span>
              <TrustPill tier={listing.grower_tier || listing.user_tier} />
              {listing.grower_verified && <span className="tag bg-moss-50 text-moss-700 text-xs">✓ Verified</span>}
            </div>
            {listing.location_label && (
              <div className="flex items-center gap-1 text-xs text-stone-400 mt-1">
                <MapPin size={10} />{listing.location_label}
              </div>
            )}
          </div>
        </div>

        {listing.description && (
          <div className="mb-4">
            <div className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5">About this listing</div>
            <p className="text-stone-700 text-sm leading-relaxed">{listing.description}</p>
          </div>
        )}

        {listing.growing_methods?.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5">Growing method</div>
            <div className="flex flex-wrap gap-1.5">
              {listing.growing_methods.map(m => (
                <span key={m} className="tag bg-moss-50 text-moss-700 text-xs">{m.replace('_', ' ')}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl mb-5">
          <div>
            <div className="text-xs text-stone-500">Quantity</div>
            <div className="font-medium text-stone-800">{listing.quantity} {listing.unit}</div>
          </div>
          <CreditBadge amount={listing.credits} size="lg" />
        </div>

        <div className="flex gap-3">
          <button onClick={() => toggleWishlist(listing.crop)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${isWishlisted ? 'bg-clay-50 border-clay-200 text-clay-600' : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'}`}>
            <Heart size={15} fill={isWishlisted ? 'currentColor' : 'none'} />
            {isWishlisted ? 'Following' : 'Follow crop'}
          </button>
          {!isOwn && (
            <button onClick={() => setShowTrade(true)} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <ArrowRightLeft size={15} /> Request Trade
            </button>
          )}
          {isOwn && (
            <div className="flex-1 text-center text-sm text-stone-400 py-2.5">This is your listing</div>
          )}
        </div>
      </Modal>
      {showTrade && <TradeModal listing={listing} onClose={() => setShowTrade(false)} />}
    </>
  );
}

// ── Listing card ──────────────────────────────────────────────────────────────
export function ListingCard({ listing, view = 'grid' }) {
  const [showDetail, setShowDetail] = useState(false);
  const { user, wishlists, toggleWishlist } = useApp();
  const isWishlisted = wishlists.includes(listing.crop);

  if (view === 'list') {
    return (
      <>
        <div onClick={() => setShowDetail(true)} role="button" tabIndex={0}
          className="card p-4 flex items-center gap-4 hover:shadow-lift transition-shadow duration-200 cursor-pointer"
          onKeyDown={e => e.key === 'Enter' && setShowDetail(true)}>
          <CropPhoto listing={listing} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-medium text-stone-800 leading-tight">{listing.crop}</div>
                {listing.variety && <div className="text-xs text-stone-400 italic">{listing.variety}</div>}
              </div>
              <CreditBadge amount={listing.credits} size="sm" />
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <TierBadge tier={parseInt(listing.credit_tier || listing.tier)} />
              {listing.best_by && <FreshnessDot bestBy={listing.best_by} />}
              {listing.location_label
                ? <span className="text-xs text-stone-400 flex items-center gap-1"><MapPin size={10} />{listing.location_label}</span>
                : <span className="text-xs text-stone-400">{listing.quantity} {listing.unit}</span>}
              {listing.high_demand && <span className="tag tag-demand flex items-center gap-1"><Flame size={10} /> Demand</span>}
            </div>
          </div>
        </div>
        {showDetail && <ListingDetailModal listing={listing} onClose={() => setShowDetail(false)} />}
      </>
    );
  }

  return (
    <>
      <div onClick={() => setShowDetail(true)} role="button" tabIndex={0}
        className="card p-4 flex flex-col gap-3 hover:shadow-lift transition-shadow duration-200 cursor-pointer group"
        onKeyDown={e => e.key === 'Enter' && setShowDetail(true)}>
        <div className="flex items-start justify-between">
          <CropPhoto listing={listing} size="md" />
          <button onClick={e => { e.stopPropagation(); toggleWishlist(listing.crop); }}
            className={`p-1.5 rounded-lg transition-colors ${isWishlisted ? 'text-clay-500' : 'text-stone-300 hover:text-stone-400'}`}>
            <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div>
          <div className="font-medium text-stone-800 leading-snug">{listing.crop}</div>
          {listing.variety && <div className="text-xs text-stone-400 italic mt-0.5">{listing.variety}</div>}
          {listing.description && <p className="text-stone-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">{listing.description}</p>}
        </div>

        <div className="flex flex-wrap gap-1.5 items-center">
          <TierBadge tier={parseInt(listing.credit_tier || listing.tier)} />
          {listing.best_by && <FreshnessDot bestBy={listing.best_by} />}
          {listing.surplus && <span className="tag bg-soil-50 text-soil-600 border border-soil-100">Take It All</span>}
          {listing.high_demand && <span className="tag tag-demand flex items-center gap-1"><Flame size={10} /> Demand</span>}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-stone-50">
          <div>
            <div className="flex items-center gap-1 text-xs">
              <span className="font-medium text-stone-700">{listing.grower_name || listing.user_name}</span>
              <TrustPill tier={listing.grower_tier || listing.user_tier} />
            </div>
            <div className="text-xs text-stone-400 mt-0.5 flex items-center gap-1">
              {listing.location_label
                ? <><MapPin size={10} />{listing.location_label}</>
                : <><Package size={10} />{listing.quantity} {listing.unit}</>}
            </div>
          </div>
          <CreditBadge amount={listing.credits} size="sm" />
        </div>
      </div>
      {showDetail && <ListingDetailModal listing={listing} onClose={() => setShowDetail(false)} />}
    </>
  );
}

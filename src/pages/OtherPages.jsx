import { MapPin, Users, Flame, Bell, BellOff, ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react';
import { SectionHeader, Empty, StatCard, ReserveBar } from '../components/UI';
import { useApp } from '../context/AppContext';
import { WISHLISTS, NETWORK_STATS } from '../lib/data';

// ── Map page ──────────────────────────────────────────────────────────────────
export function MapPage() {
  const { listings } = useApp();

  return (
    <div className="page-enter">
      <SectionHeader title="Network Map" subtitle="Produce available near you" />

      {/* Privacy notice */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 mb-5 flex items-start gap-2.5">
        <MapPin size={14} className="text-stone-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-stone-500 leading-relaxed">Exact locations are never shown. Each listing is placed within ~0.2 miles of the actual pickup point. Precise address shared only after a trade is confirmed.</p>
      </div>

      {/* Map placeholder */}
      <div className="card overflow-hidden mb-5" style={{ height: 360 }}>
        <div className="w-full h-full bg-gradient-to-br from-moss-50 to-stone-100 flex flex-col items-center justify-center relative">
          {/* Simulated map dots */}
          <div className="absolute inset-0 overflow-hidden">
            {listings.map((l, i) => (
              <div key={l.id} className="absolute flex flex-col items-center"
                style={{ left: `${15 + (i * 13) % 70}%`, top: `${20 + (i * 17) % 60}%` }}>
                <div className="w-8 h-8 rounded-full bg-white shadow-card flex items-center justify-center text-sm border-2 border-moss-400">
                  {l.photo_emoji}
                </div>
                {l.high_demand && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-clay-500 border border-white" />
                )}
              </div>
            ))}
            {/* You are here */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-card" />
              <div className="text-xs font-medium text-stone-600 mt-1 bg-white px-1.5 py-0.5 rounded shadow-sm">You</div>
            </div>
          </div>
          <div className="absolute bottom-3 right-3 bg-white/90 rounded-lg px-2.5 py-1.5 text-xs text-stone-500 font-medium shadow-sm">
            Leaflet integration in v1
          </div>
        </div>
      </div>

      {/* Nearby listings list */}
      <div className="font-medium text-stone-700 text-sm mb-3">{listings.length} listings nearby</div>
      <div className="flex flex-col gap-2">
        {listings.slice(0, 5).map(l => (
          <div key={l.id} className="card p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: l.photo_color + '22' }}>{l.photo_emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-stone-800">{l.crop}</div>
              <div className="text-xs text-stone-400 flex items-center gap-1"><MapPin size={10} />{l.distance} mi · {l.user_name}</div>
            </div>
            <div className="text-sm font-mono text-moss-700">{l.credits} cr</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Groups / Community page ───────────────────────────────────────────────────
export function Groups() {
  const { wishlists, toggleWishlist, communityBin, claimFromBin, reserve } = useApp();

  return (
    <div className="page-enter">
      <SectionHeader title="Community" subtitle="Wishlists, the Bin, and collective health" />

      {/* Wishlist / High demand crops */}
      <div className="card p-4 mb-5">
        <div className="font-medium text-stone-800 mb-1 flex items-center gap-2">
          <Flame size={14} className="text-clay-500" /> Crop Wishlists
        </div>
        <p className="text-xs text-stone-400 mb-4">Follow crops to signal demand to growers. When 10+ people want something and no one's listed it, it shows as High Demand.</p>
        <div className="flex flex-col gap-2">
          {WISHLISTS.map(w => {
            const isFollowing = wishlists.includes(w.crop);
            const isHighDemand = w.listings === 0 && w.followers >= 5;
            return (
              <div key={w.crop} className={`flex items-center justify-between p-3 rounded-xl border ${isHighDemand ? 'bg-clay-50 border-clay-100' : 'bg-stone-50 border-stone-100'}`}>
                <div>
                  <div className="text-sm font-medium text-stone-800 flex items-center gap-2">
                    {w.crop}
                    {isHighDemand && <span className="tag tag-demand text-xs flex items-center gap-1"><Flame size={10} /> High Demand</span>}
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5">{w.followers} following · {w.listings} active listing{w.listings !== 1 ? 's' : ''}</div>
                </div>
                <button onClick={() => toggleWishlist(w.crop)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isFollowing ? 'bg-moss-100 text-moss-700 hover:bg-moss-200' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                  {isFollowing ? <><BellOff size={12} /> Unfollow</> : <><Bell size={12} /> Follow</>}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Community Bin */}
      <div className="card p-4 mb-5">
        <div className="font-medium text-stone-800 mb-1">Community Bin</div>
        <p className="text-xs text-stone-400 mb-3 leading-relaxed">Surplus donated for free. Anyone can claim. Credits come from the Community Reserve — backed by member generosity, not thin air.</p>
        <ReserveBar balance={reserve.balance} donated={reserve.total_donated} />
        <div className="flex flex-col gap-2 mt-4">
          {communityBin.length === 0 ? (
            <Empty emoji="🧺" title="Bin is empty" body="Donate surplus from your Shed to replenish it." />
          ) : (
            communityBin.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                <div>
                  <div className="text-sm font-medium text-stone-800">{item.crop}</div>
                  <div className="text-xs text-stone-400">{item.quantity} · from {item.donor}</div>
                </div>
                <button onClick={() => claimFromBin(item)} className="btn-primary text-xs px-3 py-1.5">Claim</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Admin / Steward Dashboard ─────────────────────────────────────────────────
export function Admin() {
  const { user, tradeRequests, reserve, stats, disputes } = useApp();

  if (!user.is_admin) {
    return <div className="page-enter"><Empty emoji="🔒" title="Access restricted" body="This area is for community stewards." /></div>;
  }

  const pending = tradeRequests.filter(t => t.status === 'pending');

  return (
    <div className="page-enter">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center">
          <ShieldCheck size={18} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl text-stone-800">Steward Dashboard</h1>
          <p className="text-xs text-stone-400 italic">Oversight of the collective reciprocity.</p>
        </div>
      </div>

      {/* Network load */}
      <div className="card p-4 mb-5 bg-stone-800 border-stone-700">
        <div className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-3">Network Load</div>
        <div className="grid grid-cols-2 gap-3">
          {[['Active Members', stats.active_members], ['System Credits', stats.system_credits.toLocaleString()], ['Active Listings', stats.listings_active], ['Season Trades', stats.trades_this_season]].map(([k, v]) => (
            <div key={k}>
              <div className="font-mono text-xl font-medium text-white">{v}</div>
              <div className="text-xs text-stone-400">{k}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reserve health */}
      <div className="card p-4 mb-5">
        <div className="font-medium text-stone-700 text-sm mb-3">Community Reserve Health</div>
        <ReserveBar balance={reserve.balance} donated={reserve.total_donated} />
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center p-2 bg-stone-50 rounded-xl">
            <div className="font-mono text-lg text-moss-700">{reserve.balance}</div>
            <div className="text-xs text-stone-400">Available</div>
          </div>
          <div className="text-center p-2 bg-stone-50 rounded-xl">
            <div className="font-mono text-lg text-stone-700">{reserve.total_donated}</div>
            <div className="text-xs text-stone-400">Donated</div>
          </div>
          <div className="text-center p-2 bg-stone-50 rounded-xl">
            <div className="font-mono text-lg text-clay-600">{reserve.total_granted}</div>
            <div className="text-xs text-stone-400">Granted</div>
          </div>
        </div>
        {reserve.balance < 50 && (
          <div className="mt-3 bg-clay-50 border border-clay-100 rounded-xl p-3 flex items-start gap-2 text-xs text-clay-700">
            <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
            Reserve is low. Encourage members to donate surplus to the Bin before issuing further grants.
          </div>
        )}
      </div>

      {/* Stewardship queue */}
      <div className="card p-4 mb-5">
        <div className="font-medium text-stone-700 text-sm mb-1">Tier Challenges & Applications</div>
        <p className="text-xs text-stone-400 mb-4">Members requesting re-tier or trust tier upgrades.</p>
        <Empty emoji="✓" title="No pending applications" body="" />
      </div>

      {/* Active disputes */}
      <div className="card p-4">
        <div className="font-medium text-stone-700 text-sm mb-1">Active Disputes</div>
        <p className="text-xs text-stone-400 mb-4">Quality flags requiring moderator review.</p>
        <Empty emoji="✓" title="No active disputes" body="" />
      </div>
    </div>
  );
}

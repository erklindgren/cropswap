import { createContext, useContext, useState, useCallback } from 'react';
import {
  CURRENT_USER, LISTINGS, TRANSACTIONS, TRADE_REQUESTS,
  COMMUNITY_BIN, COMMUNITY_RESERVE, NETWORK_STATS, MY_WISHLISTS,
} from '../lib/data';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser]             = useState(CURRENT_USER);
  const [listings, setListings]     = useState(LISTINGS);
  const [transactions, setTxns]     = useState(TRANSACTIONS);
  const [tradeRequests, setTrades]  = useState(TRADE_REQUESTS);
  const [communityBin, setBin]      = useState(COMMUNITY_BIN);
  const [reserve, setReserve]       = useState(COMMUNITY_RESERVE);
  const [stats, setStats]           = useState(NETWORK_STATS);
  const [wishlists, setWishlists]   = useState(MY_WISHLISTS);
  const [notification, setNote]     = useState(null);
  const [activeModal, setModal]     = useState(null); // { type, data }

  const notify = useCallback((msg, type = 'success') => {
    setNote({ msg, type });
    setTimeout(() => setNote(null), 3500);
  }, []);

  // Add a new listing
  const addListing = useCallback((listing) => {
    const newL = { ...listing, id: `l-${Date.now()}`, user_id: user.id, user_name: user.name, user_tier: user.trust_tier, status: 'in_season', distance: 0 };
    setListings(prev => [newL, ...prev]);
    notify('Listing published to the Stand.');
  }, [user, notify]);

  // Request a trade
  const requestTrade = useCallback((listing, offerText) => {
    const req = {
      id: `tr-${Date.now()}`, listing_id: listing.id, status: 'pending',
      from_user: user.name, to_user: listing.user_name,
      offer: offerText, want: `${listing.quantity} ${listing.unit} ${listing.crop} (${listing.credits} Credits)`,
      message: '', created: new Date().toISOString(),
    };
    setTrades(prev => [req, ...prev]);
    notify(`Trade request sent to ${listing.user_name}.`);
  }, [user, notify]);

  // Confirm a trade (both sides — simplified for prototype)
  const confirmTrade = useCallback((tradeId) => {
    setTrades(prev => prev.map(t => t.id === tradeId ? { ...t, status: 'confirmed' } : t));
    notify('Trade confirmed. Credits transferred.');
  }, [notify]);

  // Donate to community bin (LETS: credits go to reserve)
  const donateToBin = useCallback((listing) => {
    const item = { id: `bin-${Date.now()}`, donor: user.name, crop: listing.crop, quantity: `${listing.quantity} ${listing.unit}`, tier: listing.tier, added: new Date().toISOString() };
    setBin(prev => [item, ...prev]);
    setReserve(prev => ({ ...prev, balance: prev.balance + listing.credits, total_donated: prev.total_donated + listing.credits }));
    setStats(prev => ({ ...prev, system_credits: prev.system_credits + listing.credits }));
    notify('Donated to the Community Bin. The Reserve has been credited.');
  }, [user, notify]);

  // Claim from bin (LETS: reserve debited, claimant debited)
  const claimFromBin = useCallback((binItem) => {
    if (reserve.balance < 10) { notify('Community Reserve is low. Donate surplus to replenish it.', 'warning'); return; }
    setBin(prev => prev.filter(b => b.id !== binItem.id));
    setReserve(prev => ({ ...prev, balance: prev.balance - 10, total_granted: prev.total_granted + 10 }));
    notify('Claimed from the Community Bin.');
  }, [reserve, notify]);

  // Toggle wishlist
  const toggleWishlist = useCallback((crop) => {
    setWishlists(prev => prev.includes(crop) ? prev.filter(c => c !== crop) : [...prev, crop]);
  }, []);

  // Update stewardship
  const updateStewardship = useCallback((items) => {
    setUser(prev => ({ ...prev, stewardship: items }));
    notify('Stewardship profile updated.');
  }, [notify]);

  return (
    <AppContext.Provider value={{
      user, listings, transactions, tradeRequests, communityBin,
      reserve, stats, wishlists,
      notification, activeModal, setModal,
      notify, addListing, requestTrade, confirmTrade,
      donateToBin, claimFromBin, toggleWishlist, updateStewardship,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

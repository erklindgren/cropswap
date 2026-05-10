import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, getProfile, getListings, getLedger, getMyTrades,
  getMyWishlists, getCommunityBin, getCommunityReserve, getNetworkHealth,
  getWishlistDemand, getStewardship, toggleWishlist as sbToggleWishlist,
  requestTrade as sbRequestTrade, donateToBin as sbDonateToBin,
  claimFromBin as sbClaimFromBin, upsertStewardship, acceptTrade, confirmTradeQR
} from '../lib/supabase';

const AppContext = createContext(null);

export function AppProvider({ session, children }) {
  const [user, setUser]           = useState(null);
  const [listings, setListings]   = useState([]);
  const [transactions, setTxns]   = useState([]);
  const [tradeRequests, setTrades]= useState([]);
  const [communityBin, setBin]    = useState([]);
  const [reserve, setReserve]     = useState({ balance: 0, total_donated: 0, total_granted: 0 });
  const [stats, setStats]         = useState({ active_members: 0, system_credits: 0, listings_active: 0, trades_this_season: 0 });
  const [wishlists, setWishlists] = useState([]);
  const [wishlistDemand, setDemand] = useState([]);
  const [stewardship, setStewardship] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [notification, setNote]   = useState(null);

  const notify = useCallback((msg, type = 'success') => {
    setNote({ msg, type });
    setTimeout(() => setNote(null), 3500);
  }, []);

  // ── Bootstrap all data on mount ───────────────────────────────────────────
  useEffect(() => {
    if (!session?.user) return;
    const uid = session.user.id;

    async function bootstrap() {
      setLoading(true);
      try {
        const [
          profile, listingData, ledgerData, tradeData,
          wishData, wishDemand, binData, reserveData, healthData, stewardData
        ] = await Promise.all([
          getProfile(uid),
          getListings(),
          getLedger(),
          getMyTrades(),
          getMyWishlists(),
          getWishlistDemand(),
          getCommunityBin(),
          getCommunityReserve(),
          getNetworkHealth(),
          getStewardship(uid),
        ]);

        setUser({
          ...profile,
          credits: profile.credit_balances?.balance ?? 0,
          lifetime_given: profile.credit_balances?.lifetime_given ?? 0,
          lifetime_received: profile.credit_balances?.lifetime_received ?? 0,
        });
        setListings(listingData || []);
        setTxns(ledgerData || []);
        setTrades(tradeData || []);
        setWishlists(wishData || []);
        setDemand(wishDemand || []);
        setBin(binData || []);
        setReserve(reserveData || {});
        setStats({
          active_members:   healthData?.active_members   ?? 0,
          system_credits:   healthData?.total_member_credits ?? 0,
          listings_active:  healthData?.active_listings  ?? 0,
          trades_this_season: healthData?.total_trades   ?? 0,
        });
        setStewardship(stewardData || []);
      } catch (err) {
        console.error('Bootstrap error:', err);
        notify('Failed to load some data — refresh to retry.', 'warning');
      } finally {
        setLoading(false);
      }
    }

    bootstrap();

    // Real-time: refresh listings when anything changes
    const listingsSub = supabase
      .channel('listings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, () => {
        getListings().then(data => setListings(data || []));
      })
      .subscribe();

    return () => supabase.removeChannel(listingsSub);
  }, [session]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const addListing = useCallback(async (listing) => {
    try {
      const { createListing } = await import('../lib/supabase');
      await createListing(listing);
      const fresh = await getListings();
      setListings(fresh || []);
      notify('Listing published to the Stand.');
    } catch (err) {
      notify(err.message, 'warning');
    }
  }, [notify]);

  const requestTrade = useCallback(async (listing, offerText) => {
    try {
      await sbRequestTrade({
        listingId:    listing.id,
        offerDesc:    offerText,
        offerCredits: listing.credits,
        message:      '',
      });
      const fresh = await getMyTrades();
      setTrades(fresh || []);
      notify(`Trade request sent to ${listing.grower_name || listing.user_name}.`);
    } catch (err) {
      notify(err.message, 'warning');
    }
  }, [notify]);

  const confirmTrade = useCallback(async (tradeId) => {
    try {
      const trade = tradeRequests.find(t => t.id === tradeId);
      if (trade?.qr_code) await confirmTradeQR(trade.qr_code);
      const [fresh, profile] = await Promise.all([getMyTrades(), getProfile(session.user.id)]);
      setTrades(fresh || []);
      setUser(u => ({ ...u, credits: profile.credit_balances?.balance ?? u.credits }));
      notify('Trade confirmed. Credits transferred.');
    } catch (err) {
      notify(err.message, 'warning');
    }
  }, [tradeRequests, session, notify]);

  const donateToBin = useCallback(async (listing) => {
    try {
      await sbDonateToBin({ listingId: listing.id, crop: listing.crop, quantity: `${listing.quantity} ${listing.unit}`, tier: listing.credit_tier || listing.tier });
      const [freshBin, freshReserve] = await Promise.all([getCommunityBin(), getCommunityReserve()]);
      setBin(freshBin || []);
      setReserve(freshReserve || {});
      notify('Donated to the Community Bin.');
    } catch (err) {
      notify(err.message, 'warning');
    }
  }, [notify]);

  const claimFromBin = useCallback(async (binItem) => {
    try {
      await sbClaimFromBin(binItem.id);
      const [freshBin, freshReserve] = await Promise.all([getCommunityBin(), getCommunityReserve()]);
      setBin(freshBin || []);
      setReserve(freshReserve || {});
      notify('Claimed from the Community Bin.');
    } catch (err) {
      notify(err.message, 'warning');
    }
  }, [notify]);

  const toggleWishlist = useCallback(async (crop) => {
    try {
      const isNowFollowing = await sbToggleWishlist(crop);
      setWishlists(prev => isNowFollowing ? [...prev, crop] : prev.filter(c => c !== crop));
      const freshDemand = await getWishlistDemand();
      setDemand(freshDemand || []);
    } catch (err) {
      notify(err.message, 'warning');
    }
  }, [notify]);

  const updateStewardship = useCallback(async (items) => {
    try {
      if (!session?.user) return;
      const fresh = await upsertStewardship(session.user.id, items);
      setStewardship(fresh || []);
      notify('Stewardship profile updated.');
    } catch (err) {
      notify(err.message, 'warning');
    }
  }, [session, notify]);

  return (
    <AppContext.Provider value={{
      user, listings, transactions, tradeRequests, communityBin,
      reserve, stats, wishlists, wishlistDemand, stewardship, loading,
      notification, notify,
      addListing, requestTrade, confirmTrade,
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

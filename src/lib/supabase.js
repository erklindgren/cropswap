import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    autoRefreshToken: true,
    persistSession:   true,
    detectSessionInUrl: true,
  },
});

// ── Auth helpers ──────────────────────────────────────────────────────────────

export async function signUp({ email, password, displayName, locationLabel }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName, location_label: locationLabel },
    },
  });
  if (error) throw error;

  // Profile created automatically via auth trigger — no manual insert needed
  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, credit_balances(*)')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Listings ──────────────────────────────────────────────────────────────────

export async function getListings({ radiusMiles = 10, category, tier, search } = {}) {
  let query = supabase
    .from('listing_feed')
    .select('*')
    .order('created_at', { ascending: false });

  if (category) query = query.eq('category', category);
  if (tier)     query = query.eq('credit_tier', String(tier));
  if (search)   query = query.ilike('crop', `%${search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createListing(listing) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('listings')
    .insert({ ...listing, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadListingPhoto(file, listingId) {
  const ext  = file.name.split('.').pop();
  const path = `listings/${listingId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('listing-photos').upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from('listing-photos').getPublicUrl(path);
  return data.publicUrl;
}

// ── Stewardship ───────────────────────────────────────────────────────────────

export async function getStewardship(userId) {
  const { data, error } = await supabase
    .from('stewardship')
    .select('*')
    .eq('user_id', userId)
    .eq('season_year', new Date().getFullYear())
    .order('created_at');
  if (error) throw error;
  return data;
}

export async function upsertStewardship(userId, items) {
  const year = new Date().getFullYear();
  // Delete existing season entries then reinsert
  await supabase.from('stewardship')
    .delete()
    .eq('user_id', userId)
    .eq('season_year', year);

  if (!items.length) return [];
  const { data, error } = await supabase
    .from('stewardship')
    .insert(items.map(i => ({ ...i, user_id: userId, season_year: year })))
    .select();
  if (error) throw error;
  return data;
}

// ── Trades ────────────────────────────────────────────────────────────────────

export async function requestTrade({ listingId, offerDesc, offerCredits, message }) {
  const { data, error } = await supabase.rpc('request_trade', {
    p_listing_id:    listingId,
    p_offer_desc:    offerDesc,
    p_offer_credits: offerCredits,
    p_message:       message,
  });
  if (error) throw error;
  return data; // returns trade UUID
}

export async function acceptTrade(tradeId) {
  const { data, error } = await supabase.rpc('accept_trade', { p_trade_id: tradeId });
  if (error) throw error;
  return data; // returns QR code string
}

export async function confirmTradeQR(qrCode) {
  const { data, error } = await supabase.rpc('confirm_trade_qr', { p_qr_code: qrCode });
  if (error) throw error;
  return data;
}

export async function getMyTrades() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('trades')
    .select('*, listings(crop, variety, photo_urls)')
    .or(`requester_id.eq.${user.id},listing_owner_id.eq.${user.id}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ── Ledger ────────────────────────────────────────────────────────────────────

export async function getLedger() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('ledger')
    .select('*')
    .eq('account_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

export async function getNetworkHealth() {
  const { data, error } = await supabase.from('network_health').select('*').single();
  if (error) throw error;
  return data;
}

export async function getCommunityReserve() {
  const { data, error } = await supabase
    .from('community_reserve')
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

// ── Wishlists ─────────────────────────────────────────────────────────────────

export async function getMyWishlists() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('wishlists')
    .select('crop')
    .eq('user_id', user.id);
  if (error) throw error;
  return data.map(w => w.crop);
}

export async function toggleWishlist(crop) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: existing } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('crop', crop)
    .single();

  if (existing) {
    const { error } = await supabase.from('wishlists').delete().eq('id', existing.id);
    if (error) throw error;
    return false; // now unfollowed
  } else {
    const { error } = await supabase.from('wishlists').insert({ user_id: user.id, crop });
    if (error) throw error;
    return true; // now following
  }
}

export async function getWishlistDemand() {
  const { data, error } = await supabase
    .from('wishlist_demand')
    .select('*')
    .order('follower_count', { ascending: false });
  if (error) throw error;
  return data;
}

// ── Community Bin ─────────────────────────────────────────────────────────────

export async function getCommunityBin() {
  const { data, error } = await supabase
    .from('community_bin')
    .select('*, profiles(display_name)')
    .is('claimed_by', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function donateToBin({ listingId, crop, quantity, tier }) {
  const { data, error } = await supabase.rpc('donate_to_bin', {
    p_listing_id: listingId,
    p_crop:       crop,
    p_quantity:   quantity,
    p_tier:       String(tier),
  });
  if (error) throw error;
  return data;
}

export async function claimFromBin(binItemId) {
  const { data, error } = await supabase.rpc('claim_from_bin', { p_bin_item_id: binItemId });
  if (error) throw error;
  return data;
}

// ── Drop-box locations ────────────────────────────────────────────────────────

export async function getDropboxes() {
  const { data, error } = await supabase
    .from('dropboxes')
    .select('*')
    .eq('is_active', true);
  if (error) throw error;
  return data;
}

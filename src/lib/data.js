// ── Seed data ─────────────────────────────────────────────────────────────────
// In production this all comes from Supabase. For the prototype, it's local state.

export const CURRENT_USER = {
  id: 'user-erik',
  name: 'Erik Lindgren',
  avatar: null,
  bio: 'A steward of the Duluth topsoil, dedicated to mutual aid and better tomatoes.',
  location: 'Park Point, Duluth MN',
  trust_tier: 'Seedling',
  trust_level: 1,
  credits: 20,
  lifetime_given: 40,
  lifetime_received: 20,
  joined: '2026-04-01',
  verified: false,
  is_admin: true,
  stewardship: [
    { crop: 'Mortgage Lifter Tomatoes', method: 'No-Till', status: 'growing', notes: 'Third-generation seed stock from northern Wisconsin.' },
    { crop: 'Garlic (Music variety)', method: 'Organic', status: 'coming_soon', notes: 'Planting in fall, harvest late July.' },
    { crop: 'Lemon Balm', method: 'Permaculture', status: 'in_season', notes: 'Aggressive spreader — happy to share divisions.' },
  ],
  badges: ['generous_grower', 'verified_grower'],
};

export const COMMUNITY_RESERVE = {
  balance: 340,
  total_donated: 680,
  total_granted: 340,
};

export const NETWORK_STATS = {
  active_members: 142,
  system_credits: 12480,
  listings_active: 34,
  trades_this_season: 218,
};

const now = new Date();
const daysOut = d => new Date(now.getTime() + d * 86400000).toISOString();
const daysAgo = d => new Date(now.getTime() - d * 86400000).toISOString();

export const LISTINGS = [
  {
    id: 'l-001', user_id: 'user-maya', user_name: 'Maya Okonkwo', user_tier: 'Steward',
    crop: 'Heirloom Tomatoes', variety: 'Cherokee Purple', category: 'fresh',
    description: 'Deep burgundy, rich flavor. Grown without spray in raised beds. About 2 lbs per bundle.',
    quantity: 3, unit: 'lb', tier: 1, credits: 10,
    best_by: daysOut(4), status: 'in_season',
    photo_color: '#8B4A3A', photo_emoji: '🍅',
    location: 'East Hillside', distance: 1.2, high_demand: true,
    growing_methods: ['organic', 'no-till'],
  },
  {
    id: 'l-002', user_id: 'user-sven', user_name: 'Sven Halvorsen', user_tier: 'Grower',
    crop: 'Zucchini', variety: 'Black Beauty', category: 'fresh',
    description: 'Classic summer abundance. Medium-sized, tender skin. Take it all if you want.',
    quantity: 8, unit: 'each', tier: 1, credits: 10,
    best_by: daysOut(6), status: 'in_season',
    photo_color: '#4A7A3A', photo_emoji: '🥒',
    location: 'Kenwood', distance: 2.1, high_demand: false,
    growing_methods: ['conventional'],
    surplus: true,
  },
  {
    id: 'l-003', user_id: 'user-priya', user_name: 'Priya Nair', user_tier: 'Elder',
    crop: 'Raspberry Jam', variety: 'Wild + Heritage blend', category: 'preserved',
    description: 'Half-pint jars, low-sugar recipe. Berries from our backyard canes plus foraged wild ones.',
    quantity: 4, unit: 'jar', tier: 2, credits: 20,
    best_by: daysOut(180), status: 'in_season',
    photo_color: '#8B2252', photo_emoji: '🍓',
    location: 'Congdon Park', distance: 3.4, high_demand: false,
    growing_methods: ['organic', 'foraged'],
  },
  {
    id: 'l-004', user_id: 'user-tom', user_name: 'Tom Bjornstad', user_tier: 'Grower',
    crop: 'Garlic Braid', variety: 'Music (hardneck)', category: 'preserved',
    description: 'Cured for 4 weeks, 10-bulb braid. Strong flavor, excellent keeper.',
    quantity: 2, unit: 'braid', tier: 2, credits: 20,
    best_by: daysOut(90), status: 'in_season',
    photo_color: '#C4A882', photo_emoji: '🧄',
    location: 'Piedmont', distance: 4.1, high_demand: false,
    growing_methods: ['organic', 'seed-saving'],
  },
  {
    id: 'l-005', user_id: 'user-lin', user_name: 'Lin Nakamura', user_tier: 'Grower',
    crop: 'Kale', variety: 'Lacinato (Dino)', category: 'fresh',
    description: 'Cut-and-come-again. Very tender leaves, harvested this morning.',
    quantity: 4, unit: 'bunch', tier: 1, credits: 10,
    best_by: daysOut(3), status: 'in_season',
    photo_color: '#2D5F28', photo_emoji: '🥬',
    location: 'Morgan Park', distance: 5.8, high_demand: false,
    growing_methods: ['no-till', 'organic'],
  },
  {
    id: 'l-006', user_id: 'user-maya', user_name: 'Maya Okonkwo', user_tier: 'Steward',
    crop: 'Raw Honey', variety: 'Wildflower (local hive)', category: 'preserved',
    description: '8 oz jar, unfiltered. Light golden color, notes of clover and basswood.',
    quantity: 3, unit: 'jar', tier: 3, credits: 30,
    best_by: daysOut(365), status: 'in_season',
    photo_color: '#D4922A', photo_emoji: '🍯',
    location: 'East Hillside', distance: 1.2, high_demand: false,
    growing_methods: ['organic'],
  },
  {
    id: 'l-007', user_id: 'user-pete', user_name: 'Pete Drummond', user_tier: 'Seedling',
    crop: 'Green Beans', variety: 'Provider', category: 'fresh',
    description: 'First big harvest. Straight pods, no strings.',
    quantity: 2, unit: 'lb', tier: 1, credits: 10,
    best_by: daysOut(5), status: 'in_season',
    photo_color: '#4A8A3A', photo_emoji: '🫘',
    location: 'Gary-New Duluth', distance: 7.2, high_demand: false,
    growing_methods: ['conventional'],
  },
  {
    id: 'l-008', user_id: 'user-rin', user_name: 'Rin Sato', user_tier: 'Grower',
    crop: 'Dried Chamomile', variety: 'German', category: 'preserved',
    description: 'Sun-dried, 2 oz bag. From a 3-year-old patch. Very fragrant.',
    quantity: 5, unit: 'bag', tier: 2, credits: 20,
    best_by: daysOut(365), status: 'in_season',
    photo_color: '#D4C46A', photo_emoji: '🌼',
    location: 'Lincoln Park', distance: 2.8, high_demand: false,
    growing_methods: ['organic', 'permaculture'],
  },
];

export const WISHLISTS = [
  { crop: 'Heirloom Tomatoes', followers: 18, listings: 1 },
  { crop: 'Hot Peppers', followers: 12, listings: 0 },
  { crop: 'Sweet Corn', followers: 9, listings: 0 },
  { crop: 'Butternut Squash', followers: 7, listings: 0 },
  { crop: 'Dried Beans', followers: 5, listings: 0 },
];

export const MY_WISHLISTS = ['Hot Peppers', 'Heirloom Tomatoes'];

export const TRANSACTIONS = [
  { id: 't-001', type: 'credit', amount: 20, description: 'Gave: 2 bunches Lemon Balm to Sven H.', date: daysAgo(3), counterparty: 'Sven Halvorsen' },
  { id: 't-002', type: 'debit',  amount: 10, description: 'Received: 1 lb Kale from Lin N.', date: daysAgo(5), counterparty: 'Lin Nakamura' },
  { id: 't-003', type: 'credit', amount: 10, description: 'Gave: Herb bundle to Pete D.', date: daysAgo(8), counterparty: 'Pete Drummond' },
  { id: 't-004', type: 'debit',  amount: 20, description: 'Received: Garlic braid from Tom B.', date: daysAgo(12), counterparty: 'Tom Bjornstad' },
  { id: 't-005', type: 'grant',  amount: 10, description: 'Welcome grant from Community Reserve', date: daysAgo(40), counterparty: 'Community Reserve' },
];

export const TRADE_REQUESTS = [
  {
    id: 'tr-001', listing_id: 'l-003', status: 'pending',
    from_user: 'Erik Lindgren', to_user: 'Priya Nair',
    offer: '2 bunches Lemon Balm (20 Credits)',
    want: '1 jar Raspberry Jam (20 Credits)',
    message: 'Would love to try your jam — I have fresh lemon balm to offer.',
    created: daysAgo(1),
  },
];

export const DISPUTES = [];

export const COMMUNITY_BIN = [
  { id: 'bin-001', donor: 'Maya Okonkwo', crop: 'Zucchini', quantity: '6 each', tier: 1, added: daysAgo(1) },
  { id: 'bin-002', donor: 'Tom Bjornstad', crop: 'Cucumber', quantity: '4 each', tier: 1, added: daysAgo(2) },
];

export const HIGH_DEMAND_CROPS = WISHLISTS.filter(w => w.listings === 0 && w.followers >= 5);

export const TIER_INFO = {
  1: { label: 'Standard',       credits: 10, color: 'moss',  description: 'Common fresh produce, standard quantities' },
  2: { label: 'Labor Premium',  credits: 20, color: 'soil',  description: 'Preserved goods, labor-intensive harvests' },
  3: { label: 'Rare / Artisan', credits: 30, color: 'clay',  description: 'Honey, saffron, heritage seeds, ferments' },
};

export const TRUST_TIERS = [
  { level: 1, name: 'Seedling', description: 'New to the collective', min_trades: 0,  color: '#80AD48' },
  { level: 2, name: 'Grower',   description: 'Established trader',    min_trades: 5,  color: '#3D7010' },
  { level: 3, name: 'Steward',  description: 'Community backbone',    min_trades: 20, color: '#2D5F16' },
  { level: 4, name: 'Elder',    description: 'Community moderator',   min_trades: 50, color: '#1F4610' },
];

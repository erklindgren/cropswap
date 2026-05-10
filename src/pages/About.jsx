import { Sprout, ArrowRightLeft, Shield, Heart, Flame, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const TRUST_TIERS = [
  { name:'Seedling', emoji:'🌱', trades:0,  color:'bg-moss-50 text-moss-700',  desc:'New to the collective. You receive 10 welcome credits to make your first trade.' },
  { name:'Grower',   emoji:'🌿', trades:5,  color:'bg-moss-100 text-moss-800', desc:'You\'ve made 5+ trades and are a known contributor to the community.' },
  { name:'Steward',  emoji:'🌳', trades:20, color:'bg-moss-200 text-moss-900', desc:'20+ trades. You help maintain the health of the collective and can flag disputes.' },
  { name:'Elder',    emoji:'🍂', trades:50, color:'bg-moss-700 text-white',    desc:'50+ trades. You can moderate disputes and issue community grants.' },
];

const FAQ = [
  { q:'What is a LETS system?', a:'LETS stands for Local Exchange Trading System — a community-run network where members exchange goods and services using a shared credit system instead of money. Every credit earned by one member is balanced by a credit owed by another, so the total always nets to zero. No money ever changes hands.' },
  { q:'How do credits work?', a:'Credits are earned by giving produce and spent by receiving it. Tier 1 items (a bunch of carrots, a head of lettuce) are worth 10 credits. Tier 2 labor-intensive items (jams, dried herbs) are 20. Tier 3 rare or artisan items (honey, saffron, ferments) are 30. You can go up to -10 credits before needing to give first.' },
  { q:'What is the Community Reserve?', a:'The Reserve is a shared pool funded entirely by member donations. When you donate surplus to the Community Bin, the Reserve is credited. Those credits fund welcome grants for new members and moderator grants for members in need. Every credit in the Reserve was earned by real produce given by a real neighbor.' },
  { q:'What happens if I don\'t show up for a trade?', a:'If a confirmed trade expires without pickup, your credits are returned but a no-show flag is added to your profile. Three no-shows in 60 days suspends your listing privileges pending moderator review.' },
  { q:'How do I move up from Seedling?', a:'Simply trade. Each confirmed trade increments your trade count. At 5 trades you become a Grower, at 20 a Steward, and at 50 an Elder. Trust tiers upgrade automatically.' },
  { q:'Can I donate to people in need?', a:'Yes — the Community Bin is specifically for this. Donate any surplus from your Shed for 0 credits. Anyone can claim from the Bin for free. Members can also privately self-flag as Needs Access to claim without public disclosure.' },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-stone-100 last:border-0">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between py-4 text-left gap-4">
        <span className="font-medium text-stone-800 text-sm">{q}</span>
        {open ? <ChevronUp size={16} className="text-stone-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-stone-400 flex-shrink-0" />}
      </button>
      {open && <p className="text-stone-500 text-sm pb-4 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function About() {
  return (
    <div className="page-enter max-w-2xl mx-auto">

      {/* Hero */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-moss-600 flex items-center justify-center mx-auto mb-4 shadow-card">
          <Sprout size={28} className="text-white" />
        </div>
        <h1 className="font-display text-3xl text-stone-800 mb-3">Duluth Crop Swap</h1>
        <p className="text-stone-500 leading-relaxed">A hyperlocal produce exchange built on mutual trust, not money. Share your garden surplus with neighbors and receive theirs in return — all tracked through a fair, community-owned credit system.</p>
      </div>

      {/* How it works */}
      <div className="card p-5 mb-5">
        <h2 className="font-display text-xl text-stone-800 mb-4">How it works</h2>
        <div className="grid grid-cols-1 gap-4">
          {[
            { icon:Sprout, title:'List what you have', desc:'Add produce from your garden to the Stand. Set the tier, quantity, and best-by date. A photo helps.' },
            { icon:ArrowRightLeft, title:'Request a trade', desc:'See something you want? Send a trade request. Offer produce of equal credit value from your own garden.' },
            { icon:Shield, title:'Confirm at pickup', desc:'Meet up and scan the QR code to confirm the exchange. Credits transfer instantly and the ledger stays balanced.' },
            { icon:Heart, title:'Build community', desc:'Your Stewardship Profile shows what you\'re growing all season — not just what\'s ready. Follow growers you trust.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 items-start">
              <div className="w-9 h-9 rounded-xl bg-moss-50 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-moss-600" />
              </div>
              <div>
                <div className="font-medium text-stone-800 text-sm">{title}</div>
                <div className="text-stone-500 text-sm mt-0.5 leading-relaxed">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LETS explanation */}
      <div className="bg-moss-50 border border-moss-100 rounded-2xl p-5 mb-5">
        <div className="font-medium text-moss-800 mb-2 flex items-center gap-2">
          <Star size={14} /> What is a LETS system?
        </div>
        <p className="text-moss-700 text-sm leading-relaxed mb-3">LETS — Local Exchange Trading System — is a community-run credit network with a 40-year track record in communities worldwide. Unlike money, LETS credits can't be hoarded, don't earn interest, and don't leave the community. Every credit you earn is matched by a credit someone else owes, so the system always nets to zero.</p>
        <p className="text-moss-700 text-sm leading-relaxed">Duluth Crop Swap enforces this at the database level — the zero-sum constraint is hardcoded, not just a policy. The Community Reserve, funded entirely by member generosity, provides welcome credits for new members and support for those in need.</p>
      </div>

      {/* Trust tiers */}
      <div className="card p-5 mb-5">
        <h2 className="font-display text-xl text-stone-800 mb-1">Trust tiers</h2>
        <p className="text-stone-400 text-sm mb-4">Trade your way up. Each tier unlocks more community responsibility.</p>
        <div className="flex flex-col gap-3">
          {TRUST_TIERS.map(t => (
            <div key={t.name} className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl">
              <div className="text-2xl">{t.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-stone-800 text-sm">{t.name}</span>
                  <span className={`tag text-xs ${t.color}`}>{t.trades === 0 ? 'Starting tier' : `${t.trades}+ trades`}</span>
                </div>
                <p className="text-stone-500 text-xs leading-relaxed">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Credit tiers */}
      <div className="card p-5 mb-5">
        <h2 className="font-display text-xl text-stone-800 mb-1">Credit tiers</h2>
        <p className="text-stone-400 text-sm mb-4">All produce is assigned a fair market tier by the community.</p>
        <div className="flex flex-col gap-2">
          {[
            { tier:'T1 · Standard', credits:'10 credits', cls:'tag-t1', ex:'Bunch of carrots, head of lettuce, 1 lb zucchini, 6 eggs' },
            { tier:'T2 · Premium',  credits:'20 credits', cls:'tag-t2', ex:'Pint of raspberries, jar of jam, dried herb bundle, garlic braid' },
            { tier:'T3 · Artisan',  credits:'30 credits', cls:'tag-t3', ex:'Jar of honey, saffron, heritage seed packet, fermented goods' },
          ].map(t => (
            <div key={t.tier} className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl">
              <span className={`tag ${t.cls} flex-shrink-0`}>{t.tier}</span>
              <div className="flex-1">
                <div className="font-mono text-sm font-medium text-stone-700">{t.credits}</div>
                <div className="text-xs text-stone-400 mt-0.5">{t.ex}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community equity */}
      <div className="bg-clay-50 border border-clay-100 rounded-2xl p-5 mb-5">
        <div className="font-medium text-clay-800 mb-2 flex items-center gap-2">
          <Heart size={14} /> Community equity access
        </div>
        <p className="text-clay-700 text-sm leading-relaxed">The Community Bin lets anyone donate surplus for free. Members in need can claim from it without spending credits. If you'd like to access the Bin, you can privately self-flag in your Profile settings — no public disclosure is made. Elders and Stewards can also issue discretionary credit grants from the Community Reserve to members facing barriers.</p>
      </div>

      {/* FAQ */}
      <div className="card p-5 mb-5">
        <h2 className="font-display text-xl text-stone-800 mb-2">Common questions</h2>
        {FAQ.map(item => <FAQItem key={item.q} {...item} />)}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-stone-400 pb-4">
        <p>Duluth Crop Swap is a free community project by <span className="text-moss-600">Uppfinna, Inc.</span></p>
        <p className="mt-1">Designs rooted in nature, creating solutions for tomorrow.</p>
      </div>
    </div>
  );
}

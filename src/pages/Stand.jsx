import { useState } from 'react';
import { Search, SlidersHorizontal, Flame, LayoutGrid, List, Filter } from 'lucide-react';
import { ListingCard } from '../components/ListingCard';
import { SectionHeader, Empty } from '../components/UI';
import { useApp } from '../context/AppContext';

const FILTERS = ['All','Fresh','Preserved','Tier 1','Tier 2','Tier 3','High Demand','Take It All'];

function Skeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card p-4 animate-pulse">
          <div className="w-20 h-20 rounded-xl bg-stone-100 mb-3" />
          <div className="h-4 bg-stone-100 rounded w-2/3 mb-2" />
          <div className="h-3 bg-stone-100 rounded w-full mb-1" />
          <div className="h-3 bg-stone-100 rounded w-4/5" />
        </div>
      ))}
    </div>
  );
}

export default function Stand() {
  const { listings, wishlistDemand, loading } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [radius, setRadius] = useState(10);
  const [viewMode, setView] = useState('grid');
  const [sortBy, setSort]   = useState('distance');

  const highDemand = (wishlistDemand || []).filter(w => w.active_listing_count === 0 && w.follower_count >= 5);

  const filtered = listings.filter(l => {
    const matchSearch = !search ||
      l.crop.toLowerCase().includes(search.toLowerCase()) ||
      (l.grower_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.variety || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All'         ? true
      : filter === 'Fresh'       ? l.category === 'fresh'
      : filter === 'Preserved'   ? l.category === 'preserved'
      : filter === 'Tier 1'      ? l.credit_tier === '1'
      : filter === 'Tier 2'      ? l.credit_tier === '2'
      : filter === 'Tier 3'      ? l.credit_tier === '3'
      : filter === 'High Demand' ? l.high_demand
      : filter === 'Take It All' ? l.surplus
      : true;
    return matchSearch && matchFilter;
  }).sort((a, b) => sortBy === 'credits' ? b.credits - a.credits : 0);

  return (
    <div className="page-enter">
      {highDemand.length > 0 && (
        <div className="bg-clay-50 border border-clay-100 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 text-clay-700 font-medium text-sm mb-2">
            <Flame size={14} /> Your area needs these crops
          </div>
          <div className="flex flex-wrap gap-2">
            {highDemand.map(c => (
              <span key={c.crop} className="tag tag-demand">
                {c.crop} · {c.follower_count} growers waiting
              </span>
            ))}
          </div>
        </div>
      )}

      <SectionHeader
        title="Duluth Collective Stand"
        subtitle="What's growing near you"
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => setView(v => v === 'grid' ? 'list' : 'grid')} className="btn-ghost p-2">
              {viewMode === 'grid' ? <List size={16} /> : <LayoutGrid size={16} />}
            </button>
            <select value={sortBy} onChange={e => setSort(e.target.value)}
              className="text-sm bg-transparent border border-stone-200 rounded-lg px-2 py-1.5 text-stone-600 focus:outline-none">
              <option value="distance">Nearest</option>
              <option value="credits">Credits</option>
            </select>
          </div>
        }
      />

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input className="input pl-9" placeholder="Search crops, growers, varieties…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-4 px-4">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150
              ${filter === f ? 'bg-moss-600 text-white border-moss-600' : 'bg-white text-stone-600 border-stone-200 hover:border-moss-300'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-5 bg-stone-50 rounded-xl p-3">
        <Filter size={14} className="text-stone-400 flex-shrink-0" />
        <span className="text-sm text-stone-500 flex-shrink-0">Radius</span>
        <input type="range" min={1} max={25} value={radius}
          onChange={e => setRadius(+e.target.value)} className="flex-1 accent-moss-600" />
        <span className="text-sm font-mono text-stone-700 flex-shrink-0 w-12 text-right">{radius} mi</span>
      </div>

      {loading ? <Skeleton /> : filtered.length === 0 ? (
        <Empty emoji="🌱" title="Nothing here yet" body="Be the first to list something on the Stand." />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(l => <ListingCard key={l.id} listing={l} view="grid" />)}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(l => <ListingCard key={l.id} listing={l} view="list" />)}
        </div>
      )}
    </div>
  );
}

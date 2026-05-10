import { useState } from 'react';
import { Search, SlidersHorizontal, Flame, LayoutGrid, List, Filter } from 'lucide-react';
import { ListingCard } from '../components/ListingCard';
import { SectionHeader, Empty } from '../components/UI';
import { useApp } from '../context/AppContext';
import { HIGH_DEMAND_CROPS } from '../lib/data';

const FILTERS = ['All', 'Fresh', 'Preserved', 'Tier 1', 'Tier 2', 'Tier 3', 'High Demand', 'Take It All'];

export default function Stand() {
  const { listings } = useApp();
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('All');
  const [radius, setRadius]   = useState(10);
  const [viewMode, setView]   = useState('grid');
  const [sortBy, setSort]     = useState('distance');

  const filtered = listings.filter(l => {
    const matchSearch = !search || l.crop.toLowerCase().includes(search.toLowerCase()) || l.user_name.toLowerCase().includes(search.toLowerCase()) || (l.variety && l.variety.toLowerCase().includes(search.toLowerCase()));
    const matchRadius = l.distance <= radius || l.user_id === 'user-erik';
    const matchFilter = filter === 'All' ? true
      : filter === 'Fresh'       ? l.category === 'fresh'
      : filter === 'Preserved'   ? l.category === 'preserved'
      : filter === 'Tier 1'      ? l.tier === 1
      : filter === 'Tier 2'      ? l.tier === 2
      : filter === 'Tier 3'      ? l.tier === 3
      : filter === 'High Demand' ? l.high_demand
      : filter === 'Take It All' ? l.surplus
      : true;
    return matchSearch && matchRadius && matchFilter;
  }).sort((a, b) => sortBy === 'distance' ? a.distance - b.distance : b.credits - a.credits);

  return (
    <div className="page-enter">
      {/* High demand alert banner */}
      {HIGH_DEMAND_CROPS.length > 0 && (
        <div className="bg-clay-50 border border-clay-100 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 text-clay-700 font-medium text-sm mb-2">
            <Flame size={14} /> Your area needs these crops
          </div>
          <div className="flex flex-wrap gap-2">
            {HIGH_DEMAND_CROPS.map(c => (
              <span key={c.crop} className="tag tag-demand">
                {c.crop} · {c.followers} growers waiting
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
            <select value={sortBy} onChange={e => setSort(e.target.value)} className="text-sm bg-transparent border border-stone-200 rounded-lg px-2 py-1.5 text-stone-600 focus:outline-none">
              <option value="distance">Nearest</option>
              <option value="credits">Credits</option>
            </select>
          </div>
        }
      />

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input className="input pl-9" placeholder="Search crops, growers, varieties…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide -mx-4 px-4">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${filter === f ? 'bg-moss-600 text-white border-moss-600' : 'bg-white text-stone-600 border-stone-200 hover:border-moss-300'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Radius slider */}
      <div className="flex items-center gap-3 mb-5 bg-stone-50 rounded-xl p-3">
        <Filter size={14} className="text-stone-400 flex-shrink-0" />
        <span className="text-sm text-stone-500 flex-shrink-0">Radius</span>
        <input type="range" min={1} max={25} value={radius} onChange={e => setRadius(+e.target.value)}
          className="flex-1 accent-moss-600" />
        <span className="text-sm font-mono text-stone-700 flex-shrink-0 w-12 text-right">{radius} mi</span>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <Empty emoji="🌱" title="Nothing here yet" body="Try widening your radius or changing the filter." />
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

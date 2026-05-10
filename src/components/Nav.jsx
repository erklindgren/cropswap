import { useLocation, useNavigate } from 'react-router-dom';
import { Sprout, Map, Leaf, BookOpen, Users, User, ShieldCheck, Info, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const NAV = [
  { path:'/',        label:'Stand',    icon:Sprout       },
  { path:'/shed',    label:'Shed',     icon:Leaf         },
  { path:'/ledger',  label:'Ledger',   icon:BookOpen     },
  { path:'/groups',  label:'Community',icon:Users        },
  { path:'/chat',    label:'Chat',     icon:MessageCircle},
  { path:'/profile', label:'Profile',  icon:User         },
];

export default function Nav() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { user, loading } = useApp();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 bg-cream/90 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => nav('/')} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-moss-600 flex items-center justify-center shadow-sm group-hover:bg-moss-700 transition-colors">
              <Sprout size={16} className="text-white" />
            </div>
            <span className="font-display text-lg text-stone-800 tracking-tight whitespace-nowrap">
              <span className="hidden sm:inline">Duluth </span><span className="text-moss-600">Crop Swap</span>
            </span>
          </button>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 bg-moss-50 border border-moss-100 rounded-full px-3 py-1.5">
              <span className="font-mono text-sm font-medium text-moss-700">{user?.credits ?? 0}</span>
              <span className="text-xs text-moss-500">credits</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-stone-100 text-xs font-medium text-stone-600">
              <span className="w-1.5 h-1.5 rounded-full bg-moss-400 inline-block" />
              {user?.trust_tier ? user.trust_tier.charAt(0).toUpperCase() + user.trust_tier.slice(1) : 'Seedling'}
            </div>
            <button onClick={() => nav('/about')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-stone-100 text-xs font-medium text-stone-500 hover:bg-stone-200 transition-colors">
              <Info size={12} /> About
            </button>
            {user?.is_admin && (
              <button onClick={() => nav('/admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${pathname === '/admin' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                <ShieldCheck size={12} /> Admin
              </button>
            )}
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-cream/95 backdrop-blur-md border-t border-stone-100">
        <div className="max-w-5xl mx-auto px-2 h-16 flex items-center justify-around">
          {NAV.map(({ path, label, icon: Icon }) => {
            const active = pathname === path;
            return (
              <button key={path} onClick={() => nav(path)} className={`nav-link ${active ? 'nav-link-active' : ''}`}>
                <Icon size={20} strokeWidth={active ? 2 : 1.5} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

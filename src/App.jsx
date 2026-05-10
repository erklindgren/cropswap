import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Nav from './components/Nav';
import { Toast } from './components/UI';
import Stand from './pages/Stand';
import Shed from './pages/Shed';
import Ledger from './pages/Ledger';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import { MapPage, Groups, Admin } from './pages/OtherPages';
import { supabase } from './lib/supabase';

function Layout() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-5xl mx-auto px-4 pt-20 pb-24">
        <Routes>
          <Route path="/"        element={<Stand />} />
          <Route path="/map"     element={<MapPage />} />
          <Route path="/shed"    element={<Shed />} />
          <Route path="/ledger"  element={<Ledger />} />
          <Route path="/groups"  element={<Groups />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin"   element={<Admin />} />
        </Routes>
      </main>
      <Toast />
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Loading state
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-moss-300 border-t-moss-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in — show auth page
  if (!session) {
    return <Auth onAuth={() => supabase.auth.getSession().then(({ data }) => setSession(data.session))} />;
  }

  // Logged in — show app
  return (
    <BrowserRouter>
      <AppProvider session={session}>
        <Layout />
      </AppProvider>
    </BrowserRouter>
  );
}

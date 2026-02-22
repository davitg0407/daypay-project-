
import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, Sun, Moon, ShieldCheck, Home, Briefcase, LayoutDashboard, PlusCircle, UserPlus, LogIn, Zap, MessageSquare } from 'lucide-react';
import { UserRole, Language } from '../types';
import { translations } from '../translations';
import { supabase } from '../supabase';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
  userRole: UserRole;
  toggleRole: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  userName?: string;
  session?: any;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, activePage, setActivePage, userRole, toggleRole, language, onLanguageChange, userName, session
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = translations[language];

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    // Force dark mode if requested or by default for navy theme
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActivePage('home');
  };

  const navItems = [
    { id: 'home', icon: <Home size={18} /> },
    { id: 'jobs', icon: <Briefcase size={18} /> },
    ...(session ? [
      { id: 'dashboard', icon: <LayoutDashboard size={18} /> },
      { id: 'messages', icon: <MessageSquare size={18} /> }
    ] : []),
    ...(session && userRole === 'POSTER' ? [{ id: 'admin', icon: <PlusCircle size={18} /> }] : [])
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-10">
              <div onClick={() => setActivePage('home')} className="flex items-center cursor-pointer group">
                <img 
                  src="https://i.ibb.co/7J8Yn0kW/image.png" 
                  alt="DAYPAY Logo" 
                  className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    (e.target as any).style.display = 'none';
                    const parent = (e.target as any).parentElement;
                    const span = document.createElement('span');
                    span.className = "text-2xl font-black tracking-tighter text-slate-900 dark:text-white";
                    span.innerText = "DAYPAY";
                    parent.appendChild(span);
                  }}
                />
              </div>

              {/* Desktop Nav */}
              <nav className="hidden md:flex space-x-8 text-sm font-bold uppercase tracking-widest">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`transition-all hover:text-orange-500 relative py-2 ${activePage === item.id ? 'text-orange-500' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    {t.nav[item.id as keyof typeof t.nav]}
                    {activePage === item.id && <span className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 rounded-full animate-in fade-in duration-300" />}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-3">
              <button onClick={toggleDarkMode} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300 min-h-[48px] min-w-[48px] flex items-center justify-center">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700 min-h-[48px]">
                <select value={language} onChange={(e) => onLanguageChange(e.target.value as Language)} className="bg-transparent text-xs font-black focus:outline-none cursor-pointer uppercase">
                  <option value="GE">GE</option>
                  <option value="EN">EN</option>
                </select>
              </div>

              {session ? (
                <div className="relative group">
                  <button className="flex items-center p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-500 transition-colors min-h-[48px] min-w-[48px] justify-center">
                    <img src={`https://picsum.photos/seed/${userName || 'user'}/40/40`} className="w-8 h-8 rounded-lg object-cover" />
                  </button>
                  <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-[60]">
                     <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 mb-3">
                       <p className="text-base font-black truncate">{userName || 'მომხმარებელი'}</p>
                       <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1.5 mt-1">
                         {userRole === 'WORKER' ? 'შემსრულებელი' : 'დამკვეთი'}
                         <ShieldCheck size={14} className="text-orange-500" />
                       </p>
                     </div>
                     <button onClick={toggleRole} className="w-full text-left px-6 py-3 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-200 transition-colors">
                       <UserPlus size={18} /> {language === 'GE' ? 'როლის შეცვლა' : 'Switch Role'}
                     </button>
                     <button onClick={handleLogout} className="w-full text-left px-6 py-3 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3 text-red-500 transition-colors">
                       <LogOut size={18} /> {language === 'GE' ? 'გამოსვლა' : 'Logout'}
                     </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setActivePage('login')} className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl transition-all shadow-lg shadow-orange-500/20 active:scale-95 text-xs min-h-[48px]">
                  {language === 'GE' ? 'შესვლა' : 'Login'}
                </button>
              )}

              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all min-h-[48px] min-w-[48px] flex items-center justify-center">
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-white/95 dark:bg-[#020617]/95 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-top-4 duration-300 z-40">
            <div className="p-6 space-y-3">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => { setActivePage(item.id); setIsMenuOpen(false); }} className={`w-full flex items-center gap-4 p-5 rounded-[1.5rem] transition-all ${activePage === item.id ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  {item.icon}
                  <span className="font-black text-xs uppercase tracking-widest">{t.nav[item.id as keyof typeof t.nav]}</span>
                </button>
              ))}
              {!session && (
                <button onClick={() => { setActivePage('login'); setIsMenuOpen(false); }} className="w-full flex items-center gap-4 p-5 bg-orange-500 text-white rounded-[1.5rem] transition-all font-black text-xs uppercase tracking-widest">
                  <LogIn size={20} /> {language === 'GE' ? 'შესვლა' : 'Login'}
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>

      <footer className="bg-white dark:bg-[#020617] border-t border-slate-100 dark:border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400 text-sm font-medium">© 2024 DAYPAY Marketplace. {t.footer.builtWith}.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
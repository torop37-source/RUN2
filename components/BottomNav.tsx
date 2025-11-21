
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from './Icon';

export const BottomNav: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path 
      ? "text-primary" 
      : "text-subtle-light dark:text-subtle-dark hover:text-text-light dark:hover:text-text-dark";
  };

  const filledIcon = (path: string) => location.pathname === path;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card-light dark:bg-card-dark border-t border-border-light dark:border-border-dark pb-safe pt-2 px-2 z-50 h-[calc(70px+env(safe-area-inset-bottom))]">
      <div className="flex justify-around items-end h-full pb-2">
        <Link to="/" className={`flex flex-col items-center gap-1 p-2 mb-1 ${isActive('/')}`}>
          <Icon name="dashboard" filled={filledIcon('/')} className="text-2xl" />
          <span className="text-[10px] font-bold">Accueil</span>
        </Link>
        <Link to="/program" className={`flex flex-col items-center gap-1 p-2 mb-1 ${isActive('/program')}`}>
          <Icon name="calendar_month" filled={filledIcon('/program')} className="text-2xl" />
          <span className="text-[10px] font-bold">Prog.</span>
        </Link>
        
        {/* Central Prominent Coach Button */}
        <Link to="/coach" className="relative flex flex-col items-center justify-end -top-6">
           <div className={`size-16 rounded-full flex items-center justify-center shadow-xl border-[6px] border-background-light dark:border-background-dark transition-all duration-300 ${location.pathname === '/coach' ? 'bg-primary text-background-dark -translate-y-1 shadow-primary/40' : 'bg-card-light dark:bg-card-dark text-primary'}`}>
             <Icon name="support_agent" className="text-4xl" />
           </div>
           <span className={`text-[10px] font-bold mt-1 ${location.pathname === '/coach' ? 'text-primary' : 'text-subtle-light dark:text-subtle-dark'}`}>Coach IA</span>
        </Link>

        <Link to="/history" className={`flex flex-col items-center gap-1 p-2 mb-1 ${isActive('/history')}`}>
          <Icon name="history" filled={filledIcon('/history')} className="text-2xl" />
          <span className="text-[10px] font-bold">Histor.</span>
        </Link>
        <Link to="/profile" className={`flex flex-col items-center gap-1 p-2 mb-1 ${isActive('/profile')}`}>
          <Icon name="person" filled={filledIcon('/profile')} className="text-2xl" />
          <span className="text-[10px] font-bold">Profil</span>
        </Link>
      </div>
    </nav>
  );
};

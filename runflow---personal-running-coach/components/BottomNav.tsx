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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card-light dark:bg-card-dark border-t border-border-light dark:border-border-dark pb-safe pt-2 px-4 z-40 h-[calc(60px+env(safe-area-inset-bottom))]">
      <div className="flex justify-around items-center h-full pb-2">
        <Link to="/" className={`flex flex-col items-center gap-1 p-2 ${isActive('/')}`}>
          <Icon name="dashboard" filled={filledIcon('/')} className="text-2xl" />
          <span className="text-[10px] font-medium">Accueil</span>
        </Link>
        <Link to="/program" className={`flex flex-col items-center gap-1 p-2 ${isActive('/program')}`}>
          <Icon name="calendar_month" filled={filledIcon('/program')} className="text-2xl" />
          <span className="text-[10px] font-medium">Programme</span>
        </Link>
        <Link to="/create" className="flex flex-col items-center justify-center -mt-8">
           <div className="size-14 rounded-full bg-primary text-background-dark flex items-center justify-center shadow-lg shadow-primary/30 border-4 border-background-light dark:border-background-dark">
             <Icon name="add" className="text-3xl" />
           </div>
        </Link>
        <Link to="/history" className={`flex flex-col items-center gap-1 p-2 ${isActive('/history')}`}>
          <Icon name="history" filled={filledIcon('/history')} className="text-2xl" />
          <span className="text-[10px] font-medium">Historique</span>
        </Link>
        <Link to="/profile" className={`flex flex-col items-center gap-1 p-2 ${isActive('/profile')}`}>
          <Icon name="person" filled={filledIcon('/profile')} className="text-2xl" />
          <span className="text-[10px] font-medium">Profil</span>
        </Link>
      </div>
    </nav>
  );
};
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { useUser } from '../contexts/UserContext';
import { InstallButton } from './InstallButton';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();

  const isActive = (path: string) => {
    return location.pathname === path 
      ? "bg-primary/20 text-text-light dark:text-text-dark" 
      : "text-text-light dark:text-text-dark hover:bg-primary/10";
  };

  const filledIcon = (path: string) => location.pathname === path;

  return (
    <aside className="hidden lg:flex flex-shrink-0 w-64 bg-card-light dark:bg-card-dark border-r border-border-light dark:border-border-dark p-4 flex-col justify-between h-screen sticky top-0">
      <div className="flex flex-col gap-6">
        {/* Brand / User Info */}
        <div className="flex items-center gap-3 px-2">
          <div 
            className="bg-center bg-no-repeat bg-cover rounded-full size-10 border border-border-light dark:border-border-dark bg-gray-200"
            style={{ backgroundImage: `url("${user.avatar}")` }}
          />
          <div className="flex flex-col overflow-hidden">
            <h1 className="text-text-light dark:text-text-dark text-sm font-bold leading-normal truncate">{user.name}</h1>
            <p className="text-subtle-light dark:text-subtle-dark text-xs font-normal leading-normal truncate">{user.level}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          <Link to="/" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/')}`}>
            <Icon name="dashboard" filled={filledIcon('/')} />
            <p className="text-sm font-medium leading-normal">Tableau de bord</p>
          </Link>
          <Link to="/program" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/program')}`}>
            <Icon name="calendar_month" filled={filledIcon('/program')} />
            <p className="text-sm font-medium leading-normal">Mon Programme</p>
          </Link>
          <Link to="/create" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/create')}`}>
             <Icon name="add_circle" filled={filledIcon('/create')} />
            <p className="text-sm font-medium leading-normal">Nouveau plan</p>
          </Link>
          <Link to="/history" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/history')}`}>
            <Icon name="history" filled={filledIcon('/history')} />
            <p className="text-sm font-medium leading-normal">Historique</p>
          </Link>
          <Link to="/profile" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/profile')}`}>
             <Icon name="person" filled={filledIcon('/profile')} />
            <p className="text-sm font-medium leading-normal">Mon Profil</p>
          </Link>
        </nav>
      </div>

      <div className="flex flex-col gap-4">
        <InstallButton />
        
        <button 
          onClick={() => navigate('/program')}
          className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-background-dark text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity"
        >
          <span className="truncate">Session en cours</span>
        </button>
        <div className="flex flex-col gap-1">
          <button onClick={() => alert("Aide indisponible hors ligne.")} className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-text-light dark:text-text-dark hover:bg-primary/10">
            <Icon name="help" />
            <p className="text-sm font-medium leading-normal">Aide</p>
          </button>
        </div>
      </div>
    </aside>
  );
};
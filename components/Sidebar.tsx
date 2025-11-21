import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { UserProfile } from '../types';
import { InstallButton } from './InstallButton';

const USER: UserProfile = {
  name: "Jean Dupont",
  level: "Coureur motivé",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAvmCR2C53lMgmMSyB68aF9m20thMFOVfEqy2CIPKTx4qSkJHtFdlbsY26kxTNW0RYL2q5MxJ96ouwBIrR-iOcfaC36SzFEPJ-TU-BC1ISVVKOlJKfJIHaRhsubyj2DVUW17f5A07spXZh8NH5CBmWG_zc7MumUrTpuONUMClavz4op-Inu5MCVU98wOB049rLkhtoHUbEMeMSQXBPfnNGMZG0G_pdBW_171Pfv9Q0jTi65Nsq2sJAmj5g1RROCIfE2YZU6c98lUuY"
};

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path 
      ? "bg-primary/20 text-text-light dark:text-text-dark" 
      : "text-text-light dark:text-text-dark hover:bg-primary/10";
  };

  const filledIcon = (path: string) => location.pathname === path;

  const handleLogout = () => {
    if(window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      // Logic for logout
      alert("Déconnexion...");
    }
  };

  return (
    <aside className="hidden lg:flex flex-shrink-0 w-64 bg-card-light dark:bg-card-dark border-r border-border-light dark:border-border-dark p-4 flex-col justify-between h-screen sticky top-0">
      <div className="flex flex-col gap-6">
        {/* Brand / User Info */}
        <div className="flex items-center gap-3">
          <div 
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 border-2 border-border-light dark:border-border-dark"
            style={{ backgroundImage: `url("${USER.avatar}")` }}
          />
          <div className="flex flex-col">
            <h1 className="text-text-light dark:text-text-dark text-base font-bold leading-normal">{USER.name}</h1>
            <p className="text-subtle-light dark:text-subtle-dark text-sm font-normal leading-normal">{USER.level}</p>
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
            <p className="text-sm font-medium leading-normal">Créer un plan</p>
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
          <Link to="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-light dark:text-text-dark hover:bg-primary/10">
            <Icon name="settings" />
            <p className="text-sm font-medium leading-normal">Paramètres</p>
          </Link>
          <button onClick={() => alert("Le centre d'aide sera bientôt disponible.")} className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-text-light dark:text-text-dark hover:bg-primary/10">
            <Icon name="help" />
            <p className="text-sm font-medium leading-normal">Aide</p>
          </button>
           <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10">
            <Icon name="logout" />
            <p className="text-sm font-medium leading-normal">Déconnexion</p>
          </button>
        </div>
      </div>
    </aside>
  );
};
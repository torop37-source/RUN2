import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { ProgramData } from '../types';
import { InstallButton } from '../components/InstallButton';

export const Dashboard: React.FC = () => {
  const [program, setProgram] = useState<ProgramData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
     const saved = localStorage.getItem('currentProgram');
     if (saved) setProgram(JSON.parse(saved));
  }, []);

  const weekDays = [
    { day: 'Lun', label: 'Repos', icon: 'hotel', type: 'rest' },
    { day: 'Mar', label: '5km', icon: 'directions_run', type: 'run', active: true },
    { day: 'Mer', label: 'Fractionné', icon: 'speed', type: 'interval' },
    { day: 'Jeu', label: 'Repos', icon: 'hotel', type: 'rest' },
    { day: 'Ven', label: '7km', icon: 'directions_run', type: 'run' },
    { day: 'Sam', label: 'Repos', icon: 'hotel', type: 'rest' },
    { day: 'Dim', label: '10km Long', icon: 'timer', type: 'long' },
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-8">
      {/* Mobile Install Button (Visible only on mobile if installable) */}
      <div className="lg:hidden">
         <InstallButton />
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-text-light dark:text-text-dark text-3xl md:text-4xl font-black leading-tight">Bonjour, Jean!</h1>
          <p className="text-subtle-light dark:text-subtle-dark text-base font-normal">Voici le résumé de votre semaine.</p>
        </div>
        <Link to="/create" className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark border border-border-light dark:border-border-dark hover:bg-primary/10 transition-colors font-bold text-sm">
          <Icon name="edit" className="text-lg" />
          Générer un nouveau plan
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3) */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          
          {/* AI Coach Insight */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/20 to-transparent border border-primary/20 flex gap-4 items-start">
             <div className="p-3 bg-background-light dark:bg-background-dark rounded-full text-primary shrink-0">
                <Icon name="smart_toy" filled />
             </div>
             <div>
                <h3 className="font-bold text-lg mb-1">Le conseil du Coach IA</h3>
                <p className="text-sm text-subtle-light dark:text-subtle-dark leading-relaxed">
                   {program 
                     ? `Basé sur votre objectif de ${program.goal}, cette semaine est cruciale pour le volume. N'oubliez pas de bien dormir après la séance de fractionné.`
                     : "Je n'ai pas encore assez de données. Créez votre premier programme pour recevoir des conseils personnalisés !"}
                </p>
             </div>
          </div>

          {/* Next Run Card */}
          <Link to="/program" className="flex flex-col md:flex-row rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <div 
              className="w-full md:w-1/3 h-48 md:h-auto bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
              style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBv7nPNz6bFMybbi_jvfxnuY3puBGGFYad99mr5x61rJeNT8ksHwE3CE0xTuT8gAoePI_ow__yMyE5qoiHIDmBbzaMQfDwrUsZ1f3g78GsnKSZdFWTmWOevCGO5dCjAVHhiy842iurzMDhdwhXdbjQKzOEzG5MECb87T7nDrbxw0olXL_mTewfTdKlDClK2Z-_8-3ZEBIbhIObeq158XH7qtQGFZQxoZNX1MOQcNftvO0f3gpYekI6L8BJWZZn0Pzid0YlbuZKRK-w")` }}
            />
            <div className="flex-1 p-6 flex flex-col justify-center gap-3">
              <p className="text-subtle-light dark:text-subtle-dark text-sm font-bold uppercase tracking-wider">Prochaine course : Demain</p>
              <h2 className="text-2xl font-bold text-text-light dark:text-text-dark group-hover:text-primary transition-colors">Course d'Endurance</h2>
              <p className="text-subtle-light dark:text-subtle-dark">Une course à allure modérée pour développer votre endurance de base.</p>
              <div className="flex gap-4 text-text-light dark:text-text-dark font-medium">
                 <span>Distance : <b>5 km</b></span>
                 <span className="w-px h-6 bg-border-light dark:bg-border-dark"></span>
                 <span>Durée : <b>30 min</b></span>
              </div>
              <div className="mt-2 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2 text-orange-500 font-bold text-sm">
                  <Icon name="local_fire_department" filled />
                  Session Clé
                </div>
                <span className="text-primary font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Voir les détails <Icon name="arrow_forward" />
                </span>
              </div>
            </div>
          </Link>

          {/* Weekly Overview */}
          <div>
            <h2 className="text-xl font-bold text-text-light dark:text-text-dark mb-4">Aperçu de la Semaine</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
              {weekDays.map((day, idx) => (
                <button 
                  key={idx}
                  onClick={() => navigate('/program')}
                  className={`flex flex-col gap-3 p-3 rounded-xl border text-center items-center transition-all
                    ${day.active 
                      ? 'bg-card-light dark:bg-card-dark border-primary ring-2 ring-primary shadow-md scale-105' 
                      : 'bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark opacity-90 hover:opacity-100 hover:border-primary/50'}
                  `}
                >
                  <p className={`text-sm font-bold ${day.active ? 'text-primary' : 'text-text-light dark:text-text-dark'}`}>{day.day}</p>
                  <div className={`flex justify-center items-center size-12 rounded-full ${day.active ? 'bg-primary text-text-light' : 'bg-primary/20 text-primary'}`}>
                    <Icon name={day.icon} filled={day.active} className="text-2xl" />
                  </div>
                  <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark">{day.label}</p>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (1/3) */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          
          {/* Training Load (New Card) */}
          <div className="p-6 rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark">
             <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
               <Icon name="ecg_heart" className="text-red-500" filled />
               Charge d'entraînement
             </h3>
             <p className="text-xs text-subtle-light dark:text-subtle-dark mb-4">Basé sur votre RPE et durée</p>
             
             <div className="flex items-end gap-2 h-32 mb-2">
                {[30, 45, 20, 0, 60, 10, 80].map((h, i) => (
                   <div key={i} className="flex-1 bg-primary/20 rounded-t-sm relative group">
                      <div style={{height: `${h}%`}} className={`absolute bottom-0 w-full rounded-t-sm ${h > 60 ? 'bg-orange-500' : 'bg-primary'} transition-all`}></div>
                   </div>
                ))}
             </div>
             <div className="flex justify-between text-xs font-bold text-subtle-light dark:text-subtle-dark uppercase">
                <span>Lun</span>
                <span>Dim</span>
             </div>
             <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark flex justify-between items-center">
                <span className="text-sm font-bold">Total Hebdo</span>
                <span className="text-xl font-black text-text-light dark:text-text-dark">450 UA</span>
             </div>
          </div>

          {/* Stats Card */}
          <Link to="/history" className="block p-6 rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark hover:shadow-md transition-shadow group">
            <h3 className="text-text-light-primary dark:text-text-dark-primary text-lg font-bold mb-4 flex justify-between items-center">
               Statistiques Clés
               <Icon name="arrow_forward" className="text-subtle-light group-hover:text-primary transition-colors" />
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-subtle-light dark:text-subtle-dark">
                  <Icon name="straighten" className="text-primary" />
                  <span>Distance totale</span>
                </div>
                <span className="font-bold text-text-light dark:text-text-dark">12.5 km</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-subtle-light dark:text-subtle-dark">
                  <Icon name="schedule" className="text-primary" />
                  <span>Temps total</span>
                </div>
                <span className="font-bold text-text-light dark:text-text-dark">1h 12m</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-subtle-light dark:text-subtle-dark">
                  <Icon name="avg_pace" className="text-primary" />
                  <span>Allure moyenne</span>
                </div>
                <span className="font-bold text-text-light dark:text-text-dark">5'45" /km</span>
              </div>
            </div>
          </Link>

          {/* Progress Card */}
          <Link to="/history" className="block p-6 rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark hover:shadow-md transition-shadow">
            <h3 className="font-bold text-lg mb-1 text-text-light dark:text-text-dark">Progression</h3>
            <p className="text-xs text-subtle-light dark:text-subtle-dark mb-6">Objectif 10km en 8 semaines</p>
            
            <div className="flex items-center gap-6">
              <div className="relative size-24 flex-shrink-0">
                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-primary/20" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path className="text-primary" strokeDasharray="60, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-text-light dark:text-text-dark">60%</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-subtle-light dark:text-subtle-dark">Semaine 5 sur 8</p>
                <p className="font-bold text-text-light dark:text-text-dark">Continue comme ça !</p>
              </div>
            </div>

            <div className="mt-6 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/50 rounded-lg flex items-center gap-3 text-orange-600 dark:text-orange-400">
              <Icon name="emoji_events" />
              <span className="text-sm font-bold">Nouveau record 5km !</span>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
};
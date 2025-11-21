
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { ProgramData } from '../types';
import { InstallButton } from '../components/InstallButton';
import { useUser } from '../contexts/UserContext';

export const Dashboard: React.FC = () => {
  const [program, setProgram] = useState<ProgramData | null>(null);
  const { user } = useUser();
  const navigate = useNavigate();

  const loadProgram = () => {
      const saved = localStorage.getItem('currentProgram');
      if (saved) setProgram(JSON.parse(saved));
  };

  useEffect(() => {
     loadProgram();
     
     // Listen for updates from the Coach
     const handleUpdate = () => loadProgram();
     window.addEventListener('programUpdated', handleUpdate);
     
     return () => window.removeEventListener('programUpdated', handleUpdate);
  }, []);

  const weekDays = [
    { day: 'Lun', label: 'Repos', icon: 'hotel', type: 'rest' },
    { day: 'Mar', label: '5km', icon: 'directions_run', type: 'run', active: true },
    { day: 'Mer', label: 'Frac.', icon: 'speed', type: 'interval' },
    { day: 'Jeu', label: 'Repos', icon: 'hotel', type: 'rest' },
    { day: 'Ven', label: '7km', icon: 'directions_run', type: 'run' },
    { day: 'Sam', label: 'Repos', icon: 'hotel', type: 'rest' },
    { day: 'Dim', label: '10km', icon: 'timer', type: 'long' },
  ];

  // Calcul de progression simple
  const calculateProgress = () => {
      if(!program) return 0;
      let total = 0;
      let done = 0;
      program.weeks.forEach(w => w.sessions.forEach(s => {
          total++;
          if(s.completed) done++;
      }));
      return total === 0 ? 0 : Math.round((done / total) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      
      {/* Header avec Install Button mobile */}
      <div className="flex flex-col gap-4">
        <div className="lg:hidden w-full">
           <InstallButton />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-text-light dark:text-text-dark text-2xl md:text-4xl font-black leading-tight">Bonjour, {user.name}!</h1>
            <p className="text-subtle-light dark:text-subtle-dark text-sm md:text-base font-normal">Prêt pour votre séance d'aujourd'hui ?</p>
          </div>
          <Link to="/create" className="hidden lg:flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark border border-border-light dark:border-border-dark hover:bg-primary/10 transition-colors font-bold text-sm">
            <Icon name="edit" className="text-lg" />
            Générer un nouveau plan
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3) */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          
          {/* Next Run Card (Hero) */}
          <Link to="/program" className="relative flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group">
            {/* Background Image with Overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center z-0"
              style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBv7nPNz6bFMybbi_jvfxnuY3puBGGFYad99mr5x61rJeNT8ksHwE3CE0xTuT8gAoePI_ow__yMyE5qoiHIDmBbzaMQfDwrUsZ1f3g78GsnKSZdFWTmWOevCGO5dCjAVHhiy842iurzMDhdwhXdbjQKzOEzG5MECb87T7nDrbxw0olXL_mTewfTdKlDClK2Z-_8-3ZEBIbhIObeq158XH7qtQGFZQxoZNX1MOQcNftvO0f3gpYekI6L8BJWZZn0Pzid0YlbuZKRK-w")` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-0 md:bg-gradient-to-r md:from-black/90 md:via-black/50 md:to-transparent"></div>

            <div className="relative z-10 p-6 flex flex-col justify-end md:justify-center gap-2 min-h-[200px]">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-1 rounded bg-primary text-background-dark text-xs font-bold uppercase tracking-wider">Aujourd'hui</span>
                <span className="text-white/80 text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Icon name="local_fire_department" className="text-orange-500" filled /> Session Clé</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-black text-white mb-1">{program ? "Prochaine Séance" : "Créez un plan"}</h2>
              <p className="text-gray-200 text-sm line-clamp-2 mb-4 max-w-md">
                {program ? "Consultez votre programme pour voir les détails de la séance d'aujourd'hui." : "Aucun programme actif. Cliquez ici pour commencer votre entraînement."}
              </p>
            </div>
            
             <div className="absolute top-4 right-4 z-10 md:top-auto md:bottom-6 md:right-6">
                <div className="size-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-primary group-hover:text-background-dark transition-colors">
                   <Icon name="arrow_forward" filled />
                </div>
             </div>
          </Link>

          {/* AI Coach Insight */}
          <Link to="/coach" className="p-4 rounded-xl bg-card-light dark:bg-card-dark border border-primary/30 flex gap-4 items-start shadow-sm hover:bg-primary/5 transition-colors cursor-pointer">
             <div className="p-2 bg-primary/10 rounded-full text-primary shrink-0 mt-1">
                <Icon name="support_agent" filled />
             </div>
             <div>
                <h3 className="font-bold text-base mb-1">Besoin d'un conseil ?</h3>
                <p className="text-sm text-subtle-light dark:text-subtle-dark leading-relaxed">
                   Discutez avec votre coach IA pour adapter votre plan, parler nutrition ou gérer une petite douleur. Cliquez ici pour démarrer.
                </p>
             </div>
          </Link>

          {/* Weekly Overview (Scrollable on mobile) */}
          <div>
            <div className="flex justify-between items-center mb-3">
               <h2 className="text-lg font-bold text-text-light dark:text-text-dark">Aperçu Semaine</h2>
               <Link to="/program" className="text-xs font-bold text-primary">Voir tout</Link>
            </div>
            
            <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar snap-x">
              {weekDays.map((day, idx) => (
                <button 
                  key={idx}
                  onClick={() => navigate('/program')}
                  className={`flex-none snap-center w-20 flex flex-col gap-2 p-3 rounded-2xl border text-center items-center transition-all
                    ${day.active 
                      ? 'bg-card-light dark:bg-card-dark border-primary ring-1 ring-primary shadow-lg shadow-primary/10 scale-105' 
                      : 'bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark opacity-80'}
                  `}
                >
                  <p className={`text-xs font-bold ${day.active ? 'text-primary' : 'text-subtle-light dark:text-subtle-dark'}`}>{day.day}</p>
                  <div className={`flex justify-center items-center size-8 rounded-full mb-1 ${day.active ? 'bg-primary text-text-light' : 'bg-background-light dark:bg-background-dark text-subtle-light'}`}>
                    <Icon name={day.icon} filled={day.active} className="text-lg" />
                  </div>
                  <p className="text-[10px] font-medium text-subtle-light dark:text-subtle-dark truncate w-full">{day.label}</p>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (Stats) */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
             {/* Mini Stat Card 1 */}
            <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark">
               <div className="flex items-center gap-2 mb-2 text-subtle-light dark:text-subtle-dark">
                 <Icon name="straighten" className="text-primary" />
                 <span className="text-xs font-bold uppercase">Distance Totale</span>
               </div>
               <span className="text-2xl font-black text-text-light dark:text-text-dark">0 <span className="text-sm font-normal text-subtle-light">km</span></span>
            </div>
             {/* Mini Stat Card 2 */}
            <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark">
               <div className="flex items-center gap-2 mb-2 text-subtle-light dark:text-subtle-dark">
                 <Icon name="schedule" className="text-primary" />
                 <span className="text-xs font-bold uppercase">Séances</span>
               </div>
               <span className="text-2xl font-black text-text-light dark:text-text-dark">0</span>
            </div>
          </div>

          {/* Progress Card */}
          <Link to="/history" className="block p-5 rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-base text-text-light dark:text-text-dark">Progression</h3>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">{progress}%</span>
            </div>
            
            <div className="w-full bg-background-light dark:bg-background-dark h-3 rounded-full overflow-hidden mb-2">
               <div className="bg-primary h-full rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-xs text-subtle-light dark:text-subtle-dark">{progress > 0 ? "Continuez comme ça !" : "Démarrez votre première séance !"}</p>
          </Link>

        </div>
      </div>
    </div>
  );
};

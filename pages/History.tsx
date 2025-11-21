
import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { ProgramData, RunSession } from '../types';

export const History: React.FC = () => {
  const [completedSessions, setCompletedSessions] = useState<RunSession[]>([]);
  const [filter, setFilter] = useState<'all' | 'run'>('all');

  const loadHistory = () => {
    const saved = localStorage.getItem('currentProgram');
    if (saved) {
      try {
        const program: ProgramData = JSON.parse(saved);
        const allSessions: RunSession[] = [];
        program.weeks.forEach(week => {
            week.sessions.forEach(session => {
                if (session.completed) {
                    allSessions.push(session);
                }
            });
        });
        setCompletedSessions(allSessions.reverse()); // Newest first
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    loadHistory();
    const handleUpdate = () => loadHistory();
    window.addEventListener('programUpdated', handleUpdate);
    return () => window.removeEventListener('programUpdated', handleUpdate);
  }, []);

  const filteredSessions = completedSessions.filter(s => filter === 'all' || s.type === 'run' || s.type === 'interval' || s.type === 'long');
  
  // Simple stats calculation
  const totalDistance = completedSessions.reduce((acc, curr) => {
      const dist = parseFloat(curr.distance || "0");
      return acc + (isNaN(dist) ? 0 : dist);
  }, 0);

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-8">
      <div className="flex flex-col gap-1">
          <p className="text-2xl md:text-4xl font-black text-text-light dark:text-text-dark">Mon Historique</p>
          <p className="text-sm font-normal text-subtle-light dark:text-subtle-dark">Vos sessions terminées s'affichent ici.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 rounded-xl p-4 border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark">
            <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark uppercase">Séances</p>
            <p className="text-2xl font-bold text-text-light dark:text-text-dark">{completedSessions.length}</p>
          </div>
          <div className="flex flex-col gap-1 rounded-xl p-4 border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark">
            <p className="text-xs font-medium text-subtle-light dark:text-subtle-dark uppercase">Distance Est.</p>
            <p className="text-2xl font-bold text-text-light dark:text-text-dark">{totalDistance.toFixed(1)} km</p>
          </div>
      </div>

      {/* List / Table */}
      <div className="rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark overflow-hidden">
        <div className="p-4 border-b border-border-light dark:border-border-dark flex justify-between items-center">
          <h3 className="text-base font-bold">Activités récentes</h3>
          <select 
            className="text-xs bg-transparent font-bold text-primary outline-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="all">Tout voir</option>
            <option value="run">Courses uniquement</option>
          </select>
        </div>
        
        {filteredSessions.length > 0 ? (
            <div className="flex flex-col divide-y divide-border-light dark:divide-border-dark">
                {filteredSessions.map((session, idx) => (
                    <div key={idx} className="p-4 flex items-center gap-4 hover:bg-primary/5 transition-colors">
                        <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${session.type === 'rest' ? 'bg-orange-100 text-orange-600' : 'bg-primary/20 text-primary'}`}>
                            <Icon name={session.type === 'rest' ? 'hotel' : 'directions_run'} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                                <h4 className="font-bold text-sm truncate">{session.title}</h4>
                                <span className="text-xs text-subtle-light">{session.day}</span>
                            </div>
                            <div className="flex gap-3 mt-1 text-xs text-subtle-light dark:text-subtle-dark">
                                {session.distance && <span className="flex items-center gap-1"><Icon name="straighten" className="text-[10px]" /> {session.distance}</span>}
                                {session.duration && <span className="flex items-center gap-1"><Icon name="schedule" className="text-[10px]" /> {session.duration}</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="p-8 text-center flex flex-col items-center text-subtle-light">
                <Icon name="history_toggle_off" className="text-4xl mb-2 opacity-50" />
                <p className="text-sm">Aucune séance terminée pour l'instant.</p>
                <p className="text-xs mt-1">Cochez vos séances dans "Mon Programme" pour les voir ici.</p>
            </div>
        )}
      </div>
    </div>
  );
};

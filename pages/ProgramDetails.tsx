
import React, { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { ProgramData, RunSession, WeeklyPlan } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

export const ProgramDetails: React.FC = () => {
  const [program, setProgram] = useState<ProgramData | null>(null);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [selectedSession, setSelectedSession] = useState<RunSession | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  
  // Feedback state
  const [rpe, setRpe] = useState(5);
  const [feedback, setFeedback] = useState("");

  const loadProgram = () => {
      const saved = localStorage.getItem('currentProgram');
      if (saved) {
        try {
          setProgram(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse program", e);
        }
      }
  };

  useEffect(() => {
    loadProgram();
    // Listen for coach updates
    const handleUpdate = () => loadProgram();
    window.addEventListener('programUpdated', handleUpdate);
    return () => window.removeEventListener('programUpdated', handleUpdate);
  }, []);

  // Reset feedback form when session opens
  useEffect(() => {
      if(selectedSession) {
          setRpe(selectedSession.rpe || 5);
          setFeedback(selectedSession.feedback || "");
      }
  }, [selectedSession]);

  const saveProgram = (updatedProgram: ProgramData) => {
     setProgram(updatedProgram);
     localStorage.setItem('currentProgram', JSON.stringify(updatedProgram));
     window.dispatchEvent(new Event('programUpdated'));
  };

  const toggleSessionComplete = () => {
    if (!program || !selectedSession) return;
    
    const updatedProgram = { ...program };
    const week = updatedProgram.weeks[selectedWeekIndex];
    const sessionIndex = week.sessions.findIndex(s => s.id === selectedSession.id);
    
    if (sessionIndex >= 0) {
        const isCompleting = !week.sessions[sessionIndex].completed;
        week.sessions[sessionIndex].completed = isCompleting;
        
        if (isCompleting) {
            week.sessions[sessionIndex].rpe = rpe;
            week.sessions[sessionIndex].feedback = feedback;
        }

        saveProgram(updatedProgram);
        setSelectedSession(week.sessions[sessionIndex]); // Update modal view
    }
  };

  const parseDurationToMinutes = (durationStr?: string): number => {
      if (!durationStr) return 0;
      const clean = durationStr.toLowerCase().replace(/\s/g, '');
      if (clean.includes('h')) {
          const parts = clean.split('h');
          return ((parseInt(parts[0]) || 0) * 60) + (parseInt(parts[1]) || 0);
      }
      return parseInt(clean) || 0;
  };

  const currentLoad = selectedSession ? Math.round(parseDurationToMinutes(selectedSession.duration) * rpe) : 0;

  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center px-4">
        <Icon name="sentiment_content" className="text-6xl text-subtle-light mb-4" />
        <h2 className="text-xl font-bold">Aucun programme actif</h2>
        <p className="text-subtle-light mb-6">Créez votre premier programme avec l'IA pour commencer.</p>
        <a href="#/create" className="px-6 py-2 bg-primary text-background-dark font-bold rounded-lg">Créer un programme</a>
      </div>
    );
  }

  const currentWeek = program.weeks[selectedWeekIndex] || program.weeks[0];

  const getCardStyle = (type: string, completed: boolean) => {
    if (completed) return 'bg-[#e7f3eb] dark:bg-[#1a2c20] ring-1 ring-primary border-primary/50 opacity-70';
    if (type === 'rest') return 'bg-[#fef8e2] dark:bg-[#4d401c] text-[#c69200] dark:text-[#ffdb66] border-transparent';
    if (type === 'test') return 'bg-[#fee2e2] dark:bg-[#5c2222] text-[#ef4444] dark:text-[#ef4444] border-red-200 dark:border-red-900';
    return 'bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark border-border-light dark:border-border-dark'; 
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-8 relative">
      
      {/* Modal details session */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4" onClick={() => setSelectedSession(null)}>
          <div className="bg-card-light dark:bg-card-dark rounded-t-2xl sm:rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
             <div className="p-4 sm:p-6 border-b border-border-light dark:border-border-dark flex justify-between items-start shrink-0">
                <div>
                   <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-bold text-primary uppercase tracking-wider">{selectedSession.day}</p>
                      {selectedSession.completed && <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-bold">TERMINÉE</span>}
                   </div>
                   <h2 className="text-xl sm:text-2xl font-black">{selectedSession.title}</h2>
                </div>
                <button onClick={() => setSelectedSession(null)} className="p-2 bg-background-light dark:bg-background-dark rounded-full hover:opacity-70"><Icon name="close" /></button>
             </div>
             <div className="p-4 sm:p-6 flex flex-col gap-4 overflow-y-auto">
                <p className="text-subtle-light dark:text-subtle-dark">{selectedSession.description}</p>
                
                {selectedSession.details && (
                    <>
                        <div className="flex flex-col gap-2">
                           <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">Échauffement</p>
                              <p className="text-sm">{selectedSession.details.warmup || "Standard : 15min footing lent"}</p>
                           </div>
                           <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30">
                              <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase mb-1">Retour au calme</p>
                              <p className="text-sm">{selectedSession.details.cooldown || "5min marche + étirements"}</p>
                           </div>
                        </div>
                        <div className="p-4 bg-background-light dark:bg-background-dark rounded-xl border-2 border-primary/20">
                           <p className="text-sm font-bold text-primary uppercase mb-2 flex items-center gap-2"><Icon name="timer" /> Corps de séance</p>
                           <p className="text-base font-medium whitespace-pre-wrap">{selectedSession.details.main}</p>
                        </div>
                    </>
                )}

                {/* Feedback Section (Only if not rest) */}
                {selectedSession.type !== 'rest' && (
                    <div className={`p-4 rounded-xl border ${selectedSession.completed ? 'bg-primary/5 border-primary/20' : 'bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark'}`}>
                        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                            <Icon name="rate_review" className="text-primary" /> 
                            {selectedSession.completed ? "Votre ressenti (Enregistré)" : "Ressenti de la séance"}
                        </h3>
                        
                        <div className="mb-4">
                             <div className="flex justify-between text-xs font-bold mb-2">
                                <span>RPE: {rpe}/10</span>
                                <span className="text-primary">Charge: {currentLoad}</span>
                             </div>
                             <input 
                                type="range" 
                                min="1" max="10" step="1"
                                value={rpe}
                                onChange={(e) => setRpe(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary"
                                disabled={selectedSession.completed}
                             />
                             <div className="flex justify-between text-[10px] text-subtle-light mt-1">
                                 <span>Facile</span>
                                 <span>Difficile</span>
                                 <span>Maximal</span>
                             </div>
                        </div>

                        <textarea 
                            className={`w-full p-3 rounded-lg border text-sm resize-none outline-none focus:border-primary ${selectedSession.completed ? 'bg-transparent border-transparent font-medium' : 'bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark'}`}
                            placeholder="Commentaire (ex: Douleur mollet, bonnes sensations...)"
                            rows={selectedSession.completed ? 1 : 2}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            disabled={selectedSession.completed}
                        />
                    </div>
                )}
             </div>
             <div className="p-4 bg-background-light dark:bg-background-dark border-t border-border-light dark:border-border-dark flex flex-col gap-3 shrink-0 pb-8 sm:pb-4">
                <button 
                    onClick={toggleSessionComplete}
                    className={`w-full py-3 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${selectedSession.completed ? 'bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-dark' : 'bg-primary text-background-dark hover:opacity-90'}`}
                >
                    {selectedSession.completed ? <><Icon name="undo" /> Modifier le feedback / Annuler</> : <><Icon name="check" /> Valider la séance</>}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-text-light dark:text-text-dark text-2xl md:text-4xl font-black leading-tight">{program.goal}</h1>
        <div className="flex items-center justify-between">
           <p className="text-subtle-light dark:text-subtle-dark text-sm md:text-base">Semaine {currentWeek.weekNumber} sur {program.weeks.length}</p>
           
           {/* View Toggles */}
           <div className="flex p-1 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg">
                <button onClick={() => setViewMode('week')} className={`px-3 py-1.5 rounded-md text-xs font-medium ${viewMode === 'week' ? 'bg-primary/20 text-text-light dark:text-text-dark' : 'text-subtle-light'}`}>Semaine</button>
                <button onClick={() => setViewMode('month')} className={`px-3 py-1.5 rounded-md text-xs font-medium ${viewMode === 'month' ? 'bg-primary/20 text-text-light dark:text-text-dark' : 'text-subtle-light'}`}>Mois</button>
            </div>
        </div>
      </div>

      {/* Calendar */}
      {viewMode === 'week' ? (
      <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-4">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => setSelectedWeekIndex(prev => Math.max(0, prev - 1))}
            disabled={selectedWeekIndex === 0}
            className="p-2 rounded-full hover:bg-primary/10 transition-colors disabled:opacity-30"
          >
            <Icon name="chevron_left" />
          </button>
          <h2 className="text-base font-bold text-text-light dark:text-text-dark">Semaine {currentWeek.weekNumber}</h2>
          <button 
             onClick={() => setSelectedWeekIndex(prev => Math.min(program.weeks.length - 1, prev + 1))}
             disabled={selectedWeekIndex === program.weeks.length - 1}
             className="p-2 rounded-full hover:bg-primary/10 transition-colors disabled:opacity-30"
          >
            <Icon name="chevron_right" />
          </button>
        </div>

        {/* List View for Mobile, Grid for Desktop */}
        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {currentWeek.sessions.map((session) => (
             <div 
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className={`p-4 rounded-xl flex items-center gap-4 border cursor-pointer transition-all hover:shadow-md ${getCardStyle(session.type, session.completed || false)}`}
             >
                <div className="flex flex-col items-center justify-center size-12 rounded-full bg-background-light/50 dark:bg-background-dark/50 shrink-0">
                    <span className="text-[10px] font-bold uppercase">{session.day.slice(0,3)}</span>
                    <Icon name={session.type === 'rest' ? 'hotel' : 'directions_run'} className="text-lg" />
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                         <h3 className="font-bold text-sm truncate">{session.title}</h3>
                         {session.completed && <Icon name="check_circle" className="text-primary text-sm" filled />}
                    </div>
                    <p className="text-xs opacity-80 line-clamp-1">{session.description}</p>
                    <div className="flex gap-2 mt-1">
                        {session.distance && <span className="text-[10px] font-bold inline-block bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded">{session.distance}</span>}
                        {/* Added RPE Badge */}
                        {session.completed && session.rpe && (
                            <span className="text-[10px] font-bold inline-block bg-orange-100 dark:bg-orange-900/30 text-orange-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Icon name="bolt" className="text-[10px]" filled /> {session.rpe}
                            </span>
                        )}
                    </div>
                </div>
                
                <Icon name="chevron_right" className="opacity-30 text-sm" />
             </div>
          ))}
        </div>
      </div>
      ) : (
          <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-4">
              <div className="space-y-6">
                  {program.weeks.map((week, idx) => (
                      <div key={idx}>
                          <h3 className="font-bold text-sm mb-2 text-subtle-light">Semaine {week.weekNumber}</h3>
                          <div className="grid grid-cols-7 gap-1">
                              {week.sessions.map(session => (
                                  <div 
                                    key={session.id} 
                                    className={`aspect-square rounded sm:rounded-md flex flex-col justify-center items-center text-center border text-[8px] sm:text-xs cursor-default ${session.completed ? 'bg-primary/20 border-primary text-primary font-bold' : 'bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark text-subtle-light'}`}
                                  >
                                      <span className="hidden sm:block font-bold mb-1">{session.day.split(' ')[0].slice(0,1)}</span>
                                      <Icon name={session.type === 'rest' ? 'hotel' : 'circle'} filled className="text-[10px] sm:text-base" />
                                  </div>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

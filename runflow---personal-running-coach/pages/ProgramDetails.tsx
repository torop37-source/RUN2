import React, { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { ProgramData, RunSession, WeeklyPlan } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

export const ProgramDetails: React.FC = () => {
  const [program, setProgram] = useState<ProgramData | null>(null);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [selectedSession, setSelectedSession] = useState<RunSession | null>(null);
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptationPrompt, setAdaptationPrompt] = useState("");
  const [showAdaptModal, setShowAdaptModal] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  useEffect(() => {
    const saved = localStorage.getItem('currentProgram');
    if (saved) {
      try {
        setProgram(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse program", e);
      }
    }
  }, []);

  const saveProgram = (updatedProgram: ProgramData) => {
     setProgram(updatedProgram);
     localStorage.setItem('currentProgram', JSON.stringify(updatedProgram));
  };

  const toggleSessionComplete = (session: RunSession) => {
    if (!program) return;
    
    const updatedProgram = { ...program };
    const week = updatedProgram.weeks[selectedWeekIndex];
    const sessionIndex = week.sessions.findIndex(s => s.id === session.id);
    
    if (sessionIndex >= 0) {
        week.sessions[sessionIndex].completed = !week.sessions[sessionIndex].completed;
        saveProgram(updatedProgram);
        setSelectedSession(week.sessions[sessionIndex]);
    }
  };

  const adaptProgram = async () => {
    if (!program || !adaptationPrompt) return;
    setIsAdapting(true);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `
            Voici le programme actuel (JSON): ${JSON.stringify(program.weeks[selectedWeekIndex])}.
            L'utilisateur demande: "${adaptationPrompt}".
            Réécris la semaine d'entraînement.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        weekNumber: { type: Type.INTEGER },
                        dates: { type: Type.STRING },
                        sessions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    day: { type: Type.STRING },
                                    date: { type: Type.STRING },
                                    type: { type: Type.STRING, enum: ['run', 'rest', 'interval', 'long', 'test', 'recovery'] },
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    distance: { type: Type.STRING },
                                    duration: { type: Type.STRING },
                                    completed: { type: Type.BOOLEAN },
                                    details: {
                                        type: Type.OBJECT,
                                        properties: {
                                            warmup: { type: Type.STRING },
                                            main: { type: Type.STRING },
                                            cooldown: { type: Type.STRING }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (response.text) {
            const newWeek: WeeklyPlan = JSON.parse(response.text);
            const updatedProgram = { ...program };
            updatedProgram.weeks[selectedWeekIndex] = newWeek;
            saveProgram(updatedProgram);
            setShowAdaptModal(false);
            setAdaptationPrompt("");
        }

    } catch (e) {
        console.error("Adaptation failed", e);
        alert("Impossible d'adapter le programme pour le moment.");
    } finally {
        setIsAdapting(false);
    }
  };

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

  const currentWeek = program.weeks[selectedWeekIndex];

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
             </div>
             <div className="p-4 bg-background-light dark:bg-background-dark border-t border-border-light dark:border-border-dark flex flex-col gap-3 shrink-0 pb-8 sm:pb-4">
                <button 
                    onClick={() => toggleSessionComplete(selectedSession)}
                    className={`w-full py-3 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${selectedSession.completed ? 'bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-dark' : 'bg-primary text-background-dark hover:opacity-90'}`}
                >
                    {selectedSession.completed ? <><Icon name="undo" /> Annuler</> : <><Icon name="check" /> Marquer comme terminé</>}
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
                    {session.distance && <span className="text-[10px] font-bold mt-1 inline-block bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded">{session.distance}</span>}
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
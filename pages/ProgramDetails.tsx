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
    // Load from local storage for demo persistence
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
        // Also update local selected session state
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
            
            L'utilisateur demande une modification: "${adaptationPrompt}".
            
            En tant que coach expert, réécris la semaine d'entraînement pour répondre à cette demande.
            Si l'utilisateur signale une blessure, réduis l'intensité ou change pour du repos/récupération.
            Si l'utilisateur veut changer un jour, déplace la séance.
            
            Retourne uniquement l'objet 'WeeklyPlan' modifié (le JSON complet de la semaine) respectant le schéma.
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
            // Preserve completion status if possible, though logic implies changing sessions might reset it. 
            // For now simpler to accept new structure.
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
      <div className="flex flex-col items-center justify-center h-96 text-center">
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
    if (type === 'recovery') return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border-blue-100 dark:border-blue-800';
    return 'bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark border-border-light dark:border-border-dark'; 
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-8 relative">
      
      {/* Adaptation Modal */}
      {showAdaptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl w-full max-w-lg shadow-2xl border border-border-light dark:border-border-dark">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Icon name="smart_toy" className="text-primary" />
                Coach IA
              </h3>
              <button onClick={() => setShowAdaptModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <Icon name="close" />
              </button>
            </div>
            <p className="text-sm text-subtle-light dark:text-subtle-dark mb-4">
              Dites-moi ce qui ne va pas (blessure, fatigue, emploi du temps) et j'adapterai le reste de la semaine.
            </p>
            <textarea 
              value={adaptationPrompt}
              onChange={(e) => setAdaptationPrompt(e.target.value)}
              placeholder="Ex: J'ai une douleur au tibia, remplace la séance de demain par du repos..."
              className="w-full h-32 p-3 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none resize-none mb-4"
            />
            <button 
              onClick={adaptProgram}
              disabled={isAdapting || !adaptationPrompt.trim()}
              className="w-full py-3 bg-primary text-background-dark font-bold rounded-lg hover:opacity-90 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isAdapting ? (
                <>
                  <div className="size-4 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></div>
                  Adaptation en cours...
                </>
              ) : (
                "Adapter le programme"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedSession(null)}>
          <div className="bg-card-light dark:bg-card-dark p-0 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
             <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-start">
                <div>
                   <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-bold text-primary uppercase tracking-wider">{selectedSession.day}</p>
                      {selectedSession.completed && <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-bold">TERMINÉE</span>}
                   </div>
                   <h2 className="text-2xl font-black">{selectedSession.title}</h2>
                   <p className="text-subtle-light dark:text-subtle-dark">{selectedSession.description}</p>
                </div>
                <button onClick={() => setSelectedSession(null)} className="p-2 bg-background-light dark:bg-background-dark rounded-full hover:opacity-70"><Icon name="close" /></button>
             </div>
             <div className="p-6 flex flex-col gap-6 max-h-[60vh] overflow-y-auto">
                {selectedSession.details ? (
                    <>
                        <div className="flex flex-col sm:flex-row gap-4">
                           <div className="flex-1 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-2">Échauffement</p>
                              <p className="text-sm">{selectedSession.details.warmup || "Standard : 15min footing lent"}</p>
                           </div>
                           <div className="flex-1 p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30">
                              <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase mb-2">Retour au calme</p>
                              <p className="text-sm">{selectedSession.details.cooldown || "5min marche + étirements"}</p>
                           </div>
                        </div>
                        <div className="p-6 bg-background-light dark:bg-background-dark rounded-xl border-2 border-primary/20">
                           <p className="text-sm font-bold text-primary uppercase mb-3 flex items-center gap-2"><Icon name="timer" /> Corps de séance</p>
                           <p className="text-lg font-medium whitespace-pre-wrap">{selectedSession.details.main}</p>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8 text-subtle-light">Pas de détails spécifiques pour cette séance (Repos ou Journée libre).</div>
                )}
             </div>
             <div className="p-4 bg-background-light dark:bg-background-dark border-t border-border-light dark:border-border-dark flex flex-col sm:flex-row justify-between items-center gap-4">
                 <button 
                   onClick={() => { setShowAdaptModal(true); setAdaptationPrompt(`Je ne peux pas faire la séance "${selectedSession.title}" de ${selectedSession.day}. Propose une alternative.`); setSelectedSession(null); }} 
                   className="text-sm font-bold text-subtle-light hover:text-text-light hover:underline"
                 >
                    Impossible de faire cette séance ?
                 </button>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                        onClick={() => toggleSessionComplete(selectedSession)}
                        className={`flex-1 sm:flex-none px-6 py-3 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${selectedSession.completed ? 'bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-dark' : 'bg-primary text-background-dark hover:opacity-90'}`}
                    >
                        {selectedSession.completed ? <><Icon name="undo" /> Annuler</> : <><Icon name="check" /> Marquer comme terminé</>}
                    </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap justify-between gap-4 items-start">
        <div className="flex flex-col gap-2">
          <h1 className="text-text-light dark:text-text-dark text-3xl md:text-4xl font-black leading-tight">Programme : {program.goal}</h1>
          <p className="text-subtle-light dark:text-subtle-dark text-base">Niveau {program.level}. Semaine {currentWeek.weekNumber} sur {program.weeks.length}.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
           <button 
             onClick={() => alert("Export PDF en cours de génération...")}
             className="flex items-center gap-2 h-10 px-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg text-sm font-bold hover:bg-primary/10 transition-colors"
           >
             <Icon name="picture_as_pdf" />
             <span>Exporter</span>
           </button>
           <button 
             onClick={() => alert("Événements ajoutés à votre calendrier.")}
             className="flex items-center gap-2 h-10 px-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg text-sm font-bold hover:bg-primary/10 transition-colors"
           >
             <Icon name="event" />
             <span>Calendrier</span>
           </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex flex-col gap-3 p-4 bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark">
        <div className="flex gap-6 justify-between items-center">
          <p className="font-medium text-text-light dark:text-text-dark">Progression globale</p>
          <p className="text-sm text-text-light dark:text-text-dark font-bold">{Math.round(((selectedWeekIndex + 1) / program.weeks.length) * 100)}%</p>
        </div>
        <div className="w-full h-2 bg-primary/20 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${((selectedWeekIndex + 1) / program.weeks.length) * 100}%` }}></div>
        </div>
      </div>

      {/* View Toggles */}
      <div className="flex justify-center md:justify-start">
        <div className="flex p-1 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg">
            <button 
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'week' ? 'bg-primary/20 text-text-light dark:text-text-dark' : 'text-subtle-light dark:text-subtle-dark hover:bg-primary/10'}`}
            >
                Vue Hebdomadaire
            </button>
            <button 
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'month' ? 'bg-primary/20 text-text-light dark:text-text-dark' : 'text-subtle-light dark:text-subtle-dark hover:bg-primary/10'}`}
            >
                Vue Mensuelle
            </button>
        </div>
      </div>

      {/* Calendar Grid */}
      {viewMode === 'week' ? (
      <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => setSelectedWeekIndex(prev => Math.max(0, prev - 1))}
            disabled={selectedWeekIndex === 0}
            className="p-2 rounded-full hover:bg-primary/10 transition-colors disabled:opacity-30"
          >
            <Icon name="chevron_left" />
          </button>
          <h2 className="text-lg font-bold text-text-light dark:text-text-dark">Semaine {currentWeek.weekNumber} : {currentWeek.dates}</h2>
          <button 
             onClick={() => setSelectedWeekIndex(prev => Math.min(program.weeks.length - 1, prev + 1))}
             disabled={selectedWeekIndex === program.weeks.length - 1}
             className="p-2 rounded-full hover:bg-primary/10 transition-colors disabled:opacity-30"
          >
            <Icon name="chevron_right" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {currentWeek.sessions.map((session) => (
            <div key={session.id} className="flex flex-col gap-2 p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark min-h-[200px]">
              <div className="flex justify-between items-center">
                 <p className="font-bold text-sm text-subtle-light dark:text-subtle-dark">{session.day}</p>
                 {session.completed && <Icon name="check_circle" className="text-primary" filled />}
              </div>

              <div 
                onClick={() => setSelectedSession(session)}
                className={`p-3 rounded-lg flex flex-col gap-2 h-full border ${getCardStyle(session.type, session.completed || false)} hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1`}
              >
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                     <h3 className="font-bold text-sm">{session.title}</h3>
                     {session.type === 'run' || session.type === 'interval' || session.type === 'long' ? (
                        <Icon name="directions_run" className="text-base opacity-50" />
                     ) : (
                        <Icon name="hotel" className="text-base opacity-50" />
                     )}
                  </div>
                  <p className="text-xs opacity-80 line-clamp-3">{session.description}</p>
                  {session.distance && <p className="text-xs font-bold mt-2">{session.distance}</p>}
                </div>
                
                {session.type !== 'rest' && !session.completed && (
                  <div className="border-t border-black/10 dark:border-white/10 pt-2 mt-auto flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wide opacity-70">Voir détails</span>
                    <Icon name="arrow_forward" className="text-sm" />
                  </div>
                )}
                 {session.completed && (
                     <div className="pt-2 mt-auto text-center">
                        <span className="text-[10px] font-bold uppercase text-primary">Terminé</span>
                     </div>
                 )}
              </div>
            </div>
          ))}
        </div>
      </div>
      ) : (
          <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6">
              <p className="text-center text-subtle-light dark:text-subtle-dark mb-6">Vue globale du programme</p>
              <div className="space-y-8">
                  {program.weeks.map((week, idx) => (
                      <div key={idx}>
                          <h3 className="font-bold text-lg mb-3 border-b border-border-light dark:border-border-dark pb-2">Semaine {week.weekNumber}</h3>
                          <div className="grid grid-cols-7 gap-2">
                              {week.sessions.map(session => (
                                  <div key={session.id} className={`aspect-square rounded-md p-2 text-xs flex flex-col justify-center items-center text-center border ${session.completed ? 'bg-primary/20 border-primary' : 'bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark'}`}>
                                      <span className="font-bold mb-1">{session.day.split(' ')[0]}</span>
                                      <span className="truncate w-full">{session.title}</span>
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
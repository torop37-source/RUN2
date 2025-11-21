import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { GoogleGenAI, Type } from "@google/genai";
import { ProgramData, WeeklyPlan, RunSession } from '../types';

export const CreateProgram: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const totalSteps = 4;

  // Form State
  const [formData, setFormData] = useState({
    age: '',
    gender: 'Homme',
    level: 'Intermédiaire',
    perfType: 'vma',
    perfValue: '',
    goalDistance: '10 km',
    goalTime: '',
    sessionsPerWeek: '3 séances',
    duration: '8', // Default to 8 weeks
    unavailability: '',
    injuries: ''
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const generateProgram = async () => {
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const weeksCount = parseInt(formData.duration);

      const prompt = `
        Agis comme un coach de course à pied expert et de classe mondiale.
        Crée un plan d'entraînement complet et progressif de ${weeksCount} semaines pour ce coureur :
        
        PROFIL DU COUREUR :
        - Sexe/Age: ${formData.gender}, ${formData.age} ans.
        - Niveau actuel: ${formData.level}.
        - Performance de référence: ${formData.perfValue} (${formData.perfType}).
        
        OBJECTIF :
        - Distance: ${formData.goalDistance}.
        - Chrono visé: ${formData.goalTime ? formData.goalTime : 'Finir la course confortablement'}.
        
        PARAMÈTRES :
        - Durée du plan: ${weeksCount} semaines EXACTEMENT.
        - Fréquence: ${formData.sessionsPerWeek}.
        - Contraintes/Blessures à respecter strictement: ${formData.injuries || 'Aucune'}.
        - Indisponibilités: ${formData.unavailability || 'Aucune'}.

        CONSIGNES DE STRUCTURE :
        1. Le plan doit être progressif (augmentation du volume/intensité) avec des semaines de récupération (assimilation) toutes les 3 ou 4 semaines.
        2. La dernière semaine doit être une semaine d'affûtage (tapering) avant la course.
        3. Si blessure signalée, adapte drastiquement (ex: remplacer course par repos ou renforcement).
        4. Le JSON retourné doit contenir un tableau 'weeks' avec EXACTEMENT ${weeksCount} entrées.

        SCHEMA JSON STRICT :
        Utilise uniquement les types de séance : 'run', 'rest', 'interval', 'long', 'test', 'recovery', 'tempo'.
        Pour le champ 'day', utilise le format "LUN 1", "MAR 1" etc (Jour de la semaine + Numéro du jour dans le plan global ou juste le jour de la semaine).
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              goal: { type: Type.STRING },
              level: { type: Type.STRING },
              weeks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    weekNumber: { type: Type.INTEGER },
                    dates: { type: Type.STRING, description: "Ex: Semaine 1, ou date approximative" },
                    sessions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          day: { type: Type.STRING },
                          type: { type: Type.STRING, enum: ['run', 'rest', 'interval', 'long', 'test', 'recovery', 'tempo'] },
                          title: { type: Type.STRING },
                          description: { type: Type.STRING },
                          distance: { type: Type.STRING },
                          duration: { type: Type.STRING },
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
            }
          }
        }
      });

      if (response.text) {
        let jsonStr = response.text.trim();
        // Handle potential markdown code blocks if the model outputs them despite application/json
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '').trim();
        }

        const plan: ProgramData = JSON.parse(jsonStr);
        
        if (!plan.weeks) plan.weeks = [];

        plan.createdAt = new Date().toISOString();
        
        // Generate simple IDs if missing and validate structure
        plan.weeks.forEach((w, wIdx) => {
            if (!w.sessions || !Array.isArray(w.sessions)) {
                w.sessions = [];
            }
            
            w.sessions.forEach((s, sIdx) => {
                if (!s.id) s.id = `w${wIdx}-s${sIdx}`;
            });
            
            // Ensure dates is populated roughly if empty
            if (!w.dates) w.dates = `Semaine ${w.weekNumber || (wIdx + 1)}`;
        });

        localStorage.setItem('currentProgram', JSON.stringify(plan));
        navigate('/program');
      }
    } catch (error) {
      console.error("Error generating plan:", error);
      alert("Une erreur est survenue lors de la génération ou de l'analyse du programme. Essayez de réduire la durée du programme ou réessayez.");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <div className="flex flex-col gap-10 animate-in slide-in-from-right-4 fade-in duration-300">
             <section className="flex flex-col gap-5">
                <h2 className="text-2xl font-bold pb-3 border-b border-border-light dark:border-border-dark">À propos de vous</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex flex-col gap-2">
                    <span className="font-medium text-sm">Âge</span>
                    <input type="number" value={formData.age} onChange={(e) => updateField('age', e.target.value)} placeholder="ex: 28" className="form-input h-12 px-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none" />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="font-medium text-sm">Sexe</span>
                    <select value={formData.gender} onChange={(e) => updateField('gender', e.target.value)} className="form-select h-12 px-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none">
                      <option>Homme</option>
                      <option>Femme</option>
                    </select>
                  </label>
                </div>
                <div>
                   <p className="font-medium text-sm mb-3">Niveau de course actuel</p>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {['Débutant', 'Intermédiaire', 'Avancé'].map((level) => (
                        <label key={level} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${formData.level === level ? 'bg-primary/20 border-primary' : 'border-border-light dark:border-border-dark hover:border-primary/50'}`}>
                          <input type="radio" name="level" className="text-primary focus:ring-primary" checked={formData.level === level} onChange={() => updateField('level', level)} />
                          <span className="ml-3 text-sm font-medium">{level}</span>
                        </label>
                      ))}
                   </div>
                </div>
             </section>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col gap-10 animate-in slide-in-from-right-4 fade-in duration-300">
             <section className="flex flex-col gap-5">
                <h2 className="text-2xl font-bold pb-3 border-b border-border-light dark:border-border-dark">Vos performances</h2>
                <div className="p-4 rounded-lg bg-card-dark/5 dark:bg-card-light/5 border border-border-light dark:border-border-dark">
                  <p className="text-sm opacity-80">Choisissez l'indicateur que vous connaissez. L'IA utilisera cette donnée pour calibrer les allures.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${formData.perfType === 'vma' ? 'bg-primary/20 border-primary' : 'border-border-light dark:border-border-dark'}`}>
                      <input type="radio" name="perf" className="text-primary focus:ring-primary" checked={formData.perfType === 'vma'} onChange={() => updateField('perfType', 'vma')} />
                      <span className="ml-3 text-sm font-medium">VMA (km/h)</span>
                   </label>
                   <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${formData.perfType === 'fcm' ? 'bg-primary/20 border-primary' : 'border-border-light dark:border-border-dark'}`}>
                      <input type="radio" name="perf" className="text-primary focus:ring-primary" checked={formData.perfType === 'fcm'} onChange={() => updateField('perfType', 'fcm')} />
                      <span className="ml-3 text-sm font-medium">FCM (bpm)</span>
                   </label>
                </div>
                <label className="flex flex-col gap-2">
                  <span className="font-medium text-sm">Votre valeur</span>
                  <input type="number" value={formData.perfValue} onChange={(e) => updateField('perfValue', e.target.value)} placeholder="ex: 15" className="form-input h-12 px-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none" />
                </label>
             </section>
          </div>
        );
      case 3: 
        return (
          <div className="flex flex-col gap-10 animate-in slide-in-from-right-4 fade-in duration-300">
             <section className="flex flex-col gap-5">
                <h2 className="text-2xl font-bold pb-3 border-b border-border-light dark:border-border-dark">Votre objectif</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex flex-col gap-2">
                    <span className="font-medium text-sm">Distance de la course</span>
                    <select value={formData.goalDistance} onChange={(e) => updateField('goalDistance', e.target.value)} className="form-select h-12 px-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none">
                      <option>5 km</option>
                      <option>10 km</option>
                      <option>Semi-marathon</option>
                      <option>Marathon</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="font-medium text-sm">Objectif de temps (optionnel)</span>
                    <input type="text" value={formData.goalTime} onChange={(e) => updateField('goalTime', e.target.value)} placeholder="ex: 45:00" className="form-input h-12 px-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none" />
                  </label>
                </div>

                <label className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                     <span className="font-medium text-sm">Durée du programme (semaines)</span>
                     <span className="font-bold text-primary text-lg">{formData.duration} semaines</span>
                  </div>
                  <input 
                    type="range" 
                    min="4" 
                    max="18" 
                    step="1"
                    value={formData.duration} 
                    onChange={(e) => updateField('duration', e.target.value)} 
                    className="w-full h-2 bg-border-light dark:bg-border-dark rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-subtle-light dark:text-subtle-dark">
                      <span>4 sem (Court)</span>
                      <span>8 sem (Standard)</span>
                      <span>18 sem (Long)</span>
                  </div>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="font-medium text-sm">Nombre de séances par semaine</span>
                  <select value={formData.sessionsPerWeek} onChange={(e) => updateField('sessionsPerWeek', e.target.value)} className="form-select h-12 px-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none">
                    <option>2 séances</option>
                    <option>3 séances</option>
                    <option>4 séances</option>
                    <option>5 séances</option>
                  </select>
                </label>
             </section>
          </div>
        );
      case 4:
        return (
           <div className="flex flex-col gap-10 animate-in slide-in-from-right-4 fade-in duration-300">
             <section className="flex flex-col gap-5">
                <h2 className="text-2xl font-bold pb-3 border-b border-border-light dark:border-border-dark">Vos contraintes & Blessures</h2>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">L'IA est votre coach. Soyez honnête sur vos douleurs pour qu'elle adapte le programme.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex flex-col gap-2">
                    <span className="font-medium text-sm">Période(s) d'indisponibilité</span>
                    <input type="text" value={formData.unavailability} onChange={(e) => updateField('unavailability', e.target.value)} placeholder="ex: Pas de course le Mardi" className="form-input h-12 px-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none" />
                  </label>
                </div>
                 <label className="flex flex-col gap-2">
                    <span className="font-medium text-sm">Blessures ou gênes actuelles</span>
                    <textarea value={formData.injuries} onChange={(e) => updateField('injuries', e.target.value)} placeholder="ex: Douleur légère au genou gauche, préférer le terrain souple, éviter les descentes..." className="form-textarea h-32 px-4 py-3 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none resize-none"></textarea>
                  </label>
             </section>
          </div>
        );
      default: return null;
    }
  }

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center h-[60vh] gap-8 text-center p-6">
         <div className="relative size-24">
            <div className="absolute inset-0 border-4 border-border-light dark:border-border-dark rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
            <Icon name="auto_awesome" className="absolute inset-0 m-auto text-primary text-3xl animate-pulse" />
         </div>
         <div className="flex flex-col gap-2 max-w-md">
           <h2 className="text-2xl font-bold">Construction de votre programme...</h2>
           <p className="text-subtle-light dark:text-subtle-dark">
             L'IA génère votre plan de {formData.duration} semaines. <br/>
             Cela peut prendre quelques secondes pour structurer parfaitement chaque séance.
           </p>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col pb-8">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-4xl font-black tracking-tight">Créez votre programme IA</h1>
        <p className="text-subtle-light dark:text-subtle-dark">Remplissez les informations ci-dessous. L'IA générera un plan entièrement personnalisé.</p>
      </div>

      {/* Progress Stepper */}
      <div className="flex flex-col gap-3 mb-8">
        <div className="flex justify-between text-sm font-medium">
          <p>Étape {step} sur {totalSteps}</p>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out" 
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-card-light dark:bg-card-dark p-8 rounded-xl shadow-sm border border-border-light dark:border-border-dark mb-8 min-h-[400px]">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-border-light dark:border-border-dark">
        <button 
          onClick={prevStep} 
          disabled={step === 1}
          className="px-6 py-3 rounded-lg font-bold text-text-light dark:text-text-dark disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/10 transition-colors"
        >
          Précédent
        </button>
        
        {step === totalSteps ? (
           <button onClick={generateProgram} className="px-8 py-3 rounded-lg bg-primary text-background-dark font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-primary/20">
             <Icon name="auto_awesome" />
             Générer mon programme ({formData.duration} sem)
           </button>
        ) : (
           <button onClick={nextStep} className="px-8 py-3 rounded-lg bg-primary text-background-dark font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
             Suivant
           </button>
        )}
      </div>
    </div>
  );
};
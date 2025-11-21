
import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { useUser } from '../contexts/UserContext';
import { ChatMessage, ProgramData, WeeklyPlan, RunSession } from '../types';

export const Coach: React.FC = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingProgram, setIsUpdatingProgram] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isUpdatingProgram]);

  // Helper to get context including history
  const getProgramContext = (): { program: ProgramData | null, currentWeek: WeeklyPlan | null, weekIndex: number, completedSessions: RunSession[] } => {
      const saved = localStorage.getItem('currentProgram');
      if (!saved) return { program: null, currentWeek: null, weekIndex: -1, completedSessions: [] };
      
      const program: ProgramData = JSON.parse(saved);
      const weekIndex = 0; // In a real app, find current week based on date
      
      // Flatten sessions to find completed ones
      const completedSessions: RunSession[] = [];
      program.weeks.forEach(w => {
        w.sessions.forEach(s => {
            if(s.completed) completedSessions.push(s);
        });
      });

      return { program, currentWeek: program.weeks[weekIndex], weekIndex, completedSessions };
  };

  // Helper to format history for the Prompt
  const getHistoryText = (sessions: RunSession[]) => {
      if (sessions.length === 0) return "Aucune séance terminée pour l'instant.";
      
      // Get last 5 sessions
      const recent = sessions.slice(-5);
      return recent.map(s => 
          `- ${s.day} (${s.title}): RPE=${s.rpe || 'N/A'}/10. Feedback: "${s.feedback || 'Aucun'}"`
      ).join('\n');
  };

  // Initialize Coach Greeting
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const { completedSessions } = getProgramContext();
    let initialText = `Bonjour ${user.name || 'Athlète'} ! Je suis ton coach. Je suis là pour adapter ton programme à ta forme du moment.`;

    if (completedSessions.length > 0) {
        const last = completedSessions[completedSessions.length - 1];
        
        // Proactive Analysis
        if (last.rpe && last.rpe >= 8) {
            initialText = `Bonjour ${user.name} ! J'ai vu que ta dernière séance "${last.title}" était très intense (RPE ${last.rpe}/10). Comment te sens-tu ? Veux-tu que j'allège la semaine pour favoriser la récupération ?`;
        } else if (last.feedback && /(douleur|mal|blessure|fatigue|hs|ko|pas bien)/i.test(last.feedback)) {
            initialText = `Bonjour ${user.name}. J'ai lu ton commentaire sur la dernière séance : "${last.feedback}". Ça m'inquiète un peu. Veux-tu qu'on adapte le programme ?`;
        } else {
            initialText = `Bonjour ${user.name} ! Bravo pour ta séance "${last.title}" terminée. Tout semble bien se passer. As-tu besoin d'ajustements pour la suite ?`;
        }
    }

    setMessages([{ id: 'init', role: 'model', text: initialText, timestamp: Date.now() }]);
  }, [user.name]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const { program, currentWeek, weekIndex, completedSessions } = getProgramContext();

      // Define the Tool
      const updateWeekTool: FunctionDeclaration = {
        name: 'update_week_schedule',
        description: 'Updates the training schedule for a specific week. Call this tool IMMEDIATELY when the user asks to change, swap, move, or delete sessions.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                weekNumber: { type: Type.INTEGER, description: "The week number to update." },
                reason: { type: Type.STRING, description: "Short confirmation message for the user (e.g. 'J'ai déplacé la séance de mardi à jeudi')." },
                sessions: {
                    type: Type.ARRAY,
                    description: "The FULL list of 7 sessions for the week (Lun-Dim). You must rewrite the entire week structure.",
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
            },
            required: ['weekNumber', 'sessions', 'reason']
        }
      };

      // Contextual System Instruction
      let systemInstruction = `Tu es un coach de course à pied expert.
      L'utilisateur s'appelle ${user.name}, niveau ${user.level}.
      
      TA MISSION :
      Adapter le programme en fonction du feedback de l'utilisateur.
      
      HISTORIQUE RÉCENT (TRÈS IMPORTANT) :
      ${getHistoryText(completedSessions)}
      
      Analyse cet historique. Si l'utilisateur mentionne de la fatigue ou une douleur, vérifie si cela correspond aux séances précédentes (RPE élevé, commentaires).
      Sois proactif : si le RPE est élevé, propose de réduire l'intensité.
      
      PROGRAMME ACTUEL (Semaine ${currentWeek?.weekNumber || 1}) :
      ${currentWeek ? JSON.stringify(currentWeek) : "Aucun programme actif."}
      
      OUTIL DE MODIFICATION :
      Tu as un ACCÈS TOTAL en écriture via l'outil 'update_week_schedule'.
      Si tu dois modifier le programme (alléger, déplacer, annuler), fais-le DIRECTEMENT via l'outil. Ne demande pas confirmation si l'intention de l'utilisateur est claire.
      `;

      const history = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
      }));

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [...history.map(h => ({ role: h.role, parts: h.parts })), { role: 'user', parts: [{ text: input }] }],
        config: { 
            systemInstruction: systemInstruction,
            tools: [{ functionDeclarations: [updateWeekTool] }],
            temperature: 0.3 
        }
      });

      const response = result.candidates?.[0]?.content;
      const functionCall = response?.parts?.find(p => p.functionCall)?.functionCall;
      
      if (functionCall) {
          if (functionCall.name === 'update_week_schedule') {
             setIsUpdatingProgram(true);
             const args = functionCall.args as any;
             
             if (program && args.sessions) {
                 const updatedProgram = { ...program };
                 const targetWeekNum = Number(args.weekNumber);
                 const targetWeekIndex = updatedProgram.weeks.findIndex(w => w.weekNumber === targetWeekNum);
                 const finalIndex = targetWeekIndex !== -1 ? targetWeekIndex : weekIndex;
                 
                 if (finalIndex !== -1) {
                     updatedProgram.weeks[finalIndex].sessions = args.sessions;
                     
                     await new Promise(resolve => setTimeout(resolve, 800));

                     localStorage.setItem('currentProgram', JSON.stringify(updatedProgram));
                     window.dispatchEvent(new Event('programUpdated'));

                     const successMsg: ChatMessage = { 
                         id: (Date.now() + 1).toString(), 
                         role: 'model', 
                         text: `✅ ${args.reason}`, 
                         timestamp: Date.now() 
                     };
                     setMessages(prev => [...prev, successMsg]);
                 }
             }
          }
      } else if (response?.parts?.[0]?.text) {
          const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: response.parts[0].text, timestamp: Date.now() };
          setMessages(prev => [...prev, aiMsg]);
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Erreur de connexion au coach.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
      setIsUpdatingProgram(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)]">
      <div className="flex items-center gap-3 mb-4 shrink-0">
         <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Icon name="support_agent" className="text-2xl" />
         </div>
         <div>
             <h1 className="text-2xl font-black leading-tight">Coach IA</h1>
             <p className="text-sm text-subtle-light dark:text-subtle-dark">Je m'adapte à ton ressenti (RPE) et tes commentaires.</p>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-4 shadow-inner flex flex-col gap-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm md:text-base leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user' 
                ? 'bg-primary text-background-dark rounded-tr-none' 
                : 'bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark border border-border-light dark:border-border-dark rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {isUpdatingProgram && (
            <div className="flex justify-start animate-pulse">
                <div className="bg-primary/10 text-primary p-3 rounded-2xl rounded-tl-none border border-primary/20 flex gap-2 items-center text-xs font-bold uppercase tracking-wide">
                    <Icon name="settings" className="animate-spin" />
                    Mise à jour du programme en cours...
                </div>
            </div>
        )}

        {isLoading && !isUpdatingProgram && (
            <div className="flex justify-start">
                <div className="bg-background-light dark:bg-background-dark p-3 rounded-2xl rounded-tl-none border border-border-light dark:border-border-dark flex gap-1 items-center">
                    <span className="size-2 bg-subtle-light rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="size-2 bg-subtle-light rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="size-2 bg-subtle-light rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 flex gap-2 shrink-0">
        <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Parle-moi de ta forme, tes douleurs..." 
            className="flex-1 h-12 px-4 rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none shadow-sm"
        />
        <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="size-12 rounded-xl bg-primary text-background-dark flex items-center justify-center shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all"
        >
            <Icon name="send" className={isLoading ? '' : '-ml-1'} />
        </button>
      </div>
    </div>
  );
};

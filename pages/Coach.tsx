
import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { useUser } from '../contexts/UserContext';
import { ChatMessage, ProgramData, WeeklyPlan } from '../types';

export const Coach: React.FC = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: `Bonjour ${user.name || 'Athlète'} ! Je suis connecté à ton programme. Tu peux me demander de modifier tes séances (ex: "décale la séance de demain", "allège ma semaine car je suis fatigué", "remplace la sortie longue par du repos").`, timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingProgram, setIsUpdatingProgram] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isUpdatingProgram]);

  // Helper to get context
  const getProgramContext = (): { program: ProgramData | null, currentWeek: WeeklyPlan | null, weekIndex: number } => {
      const saved = localStorage.getItem('currentProgram');
      if (!saved) return { program: null, currentWeek: null, weekIndex: -1 };
      
      const program: ProgramData = JSON.parse(saved);
      // In a real app, compare dates. Here we default to the first week for simplicity
      // or the first week that isn't fully completed.
      const weekIndex = 0; 
      return { program, currentWeek: program.weeks[weekIndex], weekIndex };
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const { program, currentWeek, weekIndex } = getProgramContext();

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
                            day: { type: Type.STRING }, // e.g. "LUN 1"
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

      // Strong System Instruction
      let systemInstruction = `Tu es un coach de course à pied expert.
      L'utilisateur s'appelle ${user.name}, niveau ${user.level}.
      
      TÂCHE PRINCIPALE :
      Tu as un ACCÈS TOTAL en écriture au programme via l'outil 'update_week_schedule'.
      Si l'utilisateur exprime une douleur, une indisponibilité, ou une envie de changer son emploi du temps, tu DOIS utiliser l'outil 'update_week_schedule' pour modifier le JSON de la semaine.
      
      RÈGLES :
      1. Ne demande pas "Voulez-vous que je le change ?". Fais-le et confirme ensuite.
      2. Lors de la mise à jour, réécris les 7 jours de la semaine pour garder la structure intacte.
      3. Garde les IDs des sessions existantes si tu ne fais que les déplacer.
      `;

      if (currentWeek) {
          systemInstruction += `
          
          PROGRAMME ACTUEL (Semaine ${currentWeek.weekNumber}) :
          ${JSON.stringify(currentWeek)}
          
          Utilise ces données comme base pour tes modifications.
          `;
      } else {
          systemInstruction += "Aucun programme n'est actif. Invite l'utilisateur à en créer un dans l'onglet 'Nouveau plan'.";
      }

      // Construct history for context
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
            // Force the model to think about using the tool
            temperature: 0.3 
        }
      });

      const response = result.candidates?.[0]?.content;
      
      // Handle Function Call
      const functionCall = response?.parts?.find(p => p.functionCall)?.functionCall;
      
      if (functionCall) {
          if (functionCall.name === 'update_week_schedule') {
             setIsUpdatingProgram(true);
             const args = functionCall.args as any;
             
             if (program && args.sessions) {
                 // Execute Update
                 const updatedProgram = { ...program };
                 
                 // Find the correct week index
                 const targetWeekNum = Number(args.weekNumber);
                 const targetWeekIndex = updatedProgram.weeks.findIndex(w => w.weekNumber === targetWeekNum);
                 const finalIndex = targetWeekIndex !== -1 ? targetWeekIndex : weekIndex;
                 
                 if (finalIndex !== -1) {
                     // Update the sessions
                     updatedProgram.weeks[finalIndex].sessions = args.sessions;
                     
                     // Simulate a small delay for "Saving" effect
                     await new Promise(resolve => setTimeout(resolve, 800));

                     localStorage.setItem('currentProgram', JSON.stringify(updatedProgram));
                     
                     // Critical: Notify other components
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
             setIsUpdatingProgram(false);
          }
      } else if (response?.parts?.[0]?.text) {
          // Normal text response
          const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: response.parts[0].text, timestamp: Date.now() };
          setMessages(prev => [...prev, aiMsg]);
      }

    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = { id: Date.now().toString(), role: 'model', text: "Désolé, je n'ai pas réussi à accéder à ton programme. Vérifie ta connexion.", timestamp: Date.now() };
      setMessages(prev => [...prev, errorMsg]);
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
             <p className="text-sm text-subtle-light dark:text-subtle-dark">Je modifie votre programme en temps réel.</p>
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
            placeholder="Ex: 'J'ai mal au genou, allège la semaine'..." 
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

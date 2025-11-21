
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { Icon } from '../components/Icon';
import { Shoe } from '../types';

export const Profile: React.FC = () => {
  const { user, updateUser } = useUser();
  const [activeTab, setActiveTab] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [showAddShoe, setShowAddShoe] = useState(false);
  const [newShoe, setNewShoe] = useState({ brand: '', model: '', maxDistance: '800' });

  // Calculator State
  const [showVmaCalc, setShowVmaCalc] = useState(false);
  const [calcDist, setCalcDist] = useState('10');
  const [calcTime, setCalcTime] = useState('');

  // Local state for form inputs
  const [formData, setFormData] = useState({
    name: '',
    level: '',
    weight: '',
    height: '',
    vma: ''
  });

  useEffect(() => {
    if (user) {
        setFormData({
            name: user.name || '',
            level: user.level || 'Intermédiaire',
            weight: '75',
            height: '180',
            vma: user.vma || ''
        });
    }
    // Load shoes from local storage
    const savedShoes = localStorage.getItem('runflow_shoes');
    if (savedShoes) {
        setShoes(JSON.parse(savedShoes));
    } else {
        // Default dummy shoe
        setShoes([{
            id: '1',
            name: 'Pegasus 40',
            brand: 'Nike',
            distance: 120,
            maxDistance: 800,
            isActive: true
        }]);
    }
  }, [user]);

  const updateShoes = (newShoes: Shoe[]) => {
      setShoes(newShoes);
      localStorage.setItem('runflow_shoes', JSON.stringify(newShoes));
  };

  const addShoe = () => {
      if(!newShoe.brand || !newShoe.model) return;
      const shoe: Shoe = {
          id: Date.now().toString(),
          name: newShoe.model,
          brand: newShoe.brand,
          distance: 0,
          maxDistance: parseInt(newShoe.maxDistance) || 800,
          isActive: true
      };
      updateShoes([...shoes, shoe]);
      setShowAddShoe(false);
      setNewShoe({ brand: '', model: '', maxDistance: '800' });
  };

  const deleteShoe = (id: string) => {
      if(confirm('Supprimer cette paire ?')) {
          updateShoes(shoes.filter(s => s.id !== id));
      }
  };

  const handleChange = (field: string, value: string) => {
      setFormData(prev => ({...prev, [field]: value}));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
        updateUser({
            name: formData.name,
            level: formData.level,
            vma: formData.vma
        });
        setIsSaving(false);
        alert("Profil mis à jour avec succès !");
    }, 800);
  };

  // VMA Estimation Logic
  const estimateVMA = () => {
      // Parse time (mm:ss or hh:mm:ss)
      const parts = calcTime.split(':').map(p => parseFloat(p));
      let hours = 0, mins = 0, secs = 0;
      
      if (parts.length === 3) { [hours, mins, secs] = parts; }
      else if (parts.length === 2) { [mins, secs] = parts; }
      else if (parts.length === 1) { mins = parts[0]; }
      else return;

      const totalHours = hours + (mins / 60) + (secs / 3600);
      if (totalHours <= 0) return;

      const distKm = parseFloat(calcDist);
      const speedKmH = distKm / totalHours;

      // Coefficients (Estimated sustainability % of VMA)
      let coeff = 0.90; // Default 10km
      if (distKm <= 5) coeff = 0.95;
      else if (distKm <= 15) coeff = 0.90;
      else if (distKm <= 22) coeff = 0.85; // Semi
      else coeff = 0.80; // Marathon

      const estimated = (speedKmH / coeff).toFixed(1);
      setFormData(prev => ({ ...prev, vma: estimated }));
      setShowVmaCalc(false);
  };

  // VO2 Max Calculation Logic
  const calculateVO2Max = () => {
    const vma = parseFloat(formData.vma);
    if (!vma || isNaN(vma)) return null;
    // Formula: VO2 Max ≈ VMA * 3.5
    return (vma * 3.5).toFixed(1);
  };

  const getVO2Status = (vo2: number) => {
      if (vo2 < 35) return { label: "Débutant", color: "text-red-500", bg: "bg-red-500" };
      if (vo2 < 45) return { label: "Moyen", color: "text-orange-500", bg: "bg-orange-500" };
      if (vo2 < 55) return { label: "Bon", color: "text-green-500", bg: "bg-green-500" };
      if (vo2 < 65) return { label: "Excellent", color: "text-blue-500", bg: "bg-blue-500" };
      return { label: "Élite", color: "text-purple-500", bg: "bg-purple-500" };
  };

  const vo2Max = calculateVO2Max();
  const vo2Status = vo2Max ? getVO2Status(parseFloat(vo2Max)) : null;

  return (
    <div className="max-w-4xl mx-auto pb-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-black mb-2">Mon Profil</h1>
        <p className="text-sm md:text-base text-subtle-light dark:text-subtle-dark">Gérez vos informations, performances et matériel.</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-border-light dark:border-border-dark overflow-x-auto no-scrollbar">
         <div className="flex gap-6 min-w-max">
            {['personal', 'performance', 'gear', 'preferences'].map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 border-b-2 font-bold text-sm transition-colors capitalize ${activeTab === tab ? 'border-primary text-text-light dark:text-text-dark' : 'border-transparent text-subtle-light dark:text-subtle-dark hover:text-text-light'}`}
                >
                    {tab === 'personal' ? 'Personnel' : tab === 'performance' ? 'Santé & Perf' : tab === 'gear' ? 'Matériel' : 'Préférences'}
                </button>
            ))}
         </div>
      </div>

      <section className="p-4 md:p-8 rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark animate-in fade-in duration-300">
         {activeTab === 'personal' && (
             <div>
                <h3 className="text-lg font-bold mb-4">Vos Informations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex flex-col gap-2">
                        <span className="font-medium text-sm">Prénom / Nom d'affichage</span>
                        <input 
                            type="text" 
                            value={formData.name} 
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="form-input h-12 px-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none" 
                        />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="font-medium text-sm">Niveau estimé</span>
                         <select 
                            value={formData.level}
                            onChange={(e) => handleChange('level', e.target.value)}
                            className="form-select h-12 px-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none"
                        >
                            <option>Débutant</option>
                            <option>Intermédiaire</option>
                            <option>Avancé</option>
                            <option>Expert</option>
                        </select>
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="font-medium text-sm">Poids (kg)</span>
                        <input 
                            type="number" 
                            value={formData.weight}
                            onChange={(e) => handleChange('weight', e.target.value)}
                            className="form-input h-12 px-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none" 
                        />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="font-medium text-sm">Taille (cm)</span>
                        <input 
                            type="number" 
                            value={formData.height}
                            onChange={(e) => handleChange('height', e.target.value)}
                            className="form-input h-12 px-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none" 
                        />
                    </label>
                </div>
             </div>
         )}

         {activeTab === 'performance' && (
             <div>
                <h3 className="text-lg font-bold mb-4">Indicateurs de Performance</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-6">
                        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                            <p className="text-sm font-medium mb-2 text-primary flex items-center gap-2"><Icon name="info" /> Indice de référence</p>
                            <p className="text-xs text-subtle-light dark:text-subtle-dark">
                                Votre VMA (Vitesse Maximale Aérobie) sert de base à l'IA pour calculer vos allures et estimer votre VO2 Max.
                            </p>
                        </div>

                        <label className="flex flex-col gap-2">
                            <span className="font-medium text-sm">Votre VMA (km/h)</span>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    step="0.5"
                                    value={formData.vma} 
                                    onChange={(e) => handleChange('vma', e.target.value)}
                                    placeholder="ex: 14.5"
                                    className="form-input w-full h-12 px-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none" 
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-subtle-light text-sm font-bold">km/h</span>
                            </div>
                        </label>
                        
                        {/* VMA Estimator Toggle */}
                        <div>
                            <button 
                                onClick={() => setShowVmaCalc(!showVmaCalc)}
                                className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                            >
                                <Icon name="calculate" />
                                {showVmaCalc ? "Masquer le calculateur" : "Je ne connais pas ma VMA"}
                            </button>

                            {showVmaCalc && (
                                <div className="mt-3 p-4 rounded-xl bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark animate-in slide-in-from-top-2">
                                    <h4 className="font-bold text-sm mb-3">Estimer depuis une course</h4>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase font-bold text-subtle-light">Distance</span>
                                            <select 
                                                value={calcDist}
                                                onChange={(e) => setCalcDist(e.target.value)}
                                                className="p-2 rounded-lg bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark text-sm"
                                            >
                                                <option value="5">5 km</option>
                                                <option value="10">10 km</option>
                                                <option value="21.1">Semi-Marathon</option>
                                                <option value="42.195">Marathon</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase font-bold text-subtle-light">Chrono (mm:ss)</span>
                                            <input 
                                                type="text" 
                                                value={calcTime}
                                                onChange={(e) => setCalcTime(e.target.value)}
                                                placeholder="ex: 50:30" 
                                                className="p-2 rounded-lg bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark text-sm"
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={estimateVMA}
                                        className="w-full py-2 bg-primary text-background-dark font-bold rounded-lg text-xs"
                                    >
                                        Calculer & Mettre à jour
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* VO2 Max Gauge Card */}
                    <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark relative overflow-hidden">
                        {vo2Max ? (
                            <>
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-200 dark:bg-gray-700">
                                    <div className={`h-full transition-all duration-1000 ease-out ${vo2Status?.bg}`} style={{ width: `${Math.min(100, (parseFloat(vo2Max) / 85) * 100)}%` }}></div>
                                </div>
                                <div className="flex items-center gap-2 mb-4 text-subtle-light dark:text-subtle-dark">
                                    <Icon name="ecg_heart" className="text-red-500 animate-pulse" filled />
                                    <p className="text-xs font-bold uppercase tracking-wider">VO2 Max Estimé</p>
                                </div>
                                
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-6xl font-black tracking-tighter text-text-light dark:text-text-dark">{vo2Max}</span>
                                    <span className="text-sm font-bold text-subtle-light">ml/kg/min</span>
                                </div>
                                
                                {vo2Status && (
                                    <div className={`mt-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${vo2Status.bg.replace('bg-', 'border-').replace('500', '200')} ${vo2Status.color} bg-opacity-10`}>
                                        Niveau {vo2Status.label}
                                    </div>
                                )}
                                
                                <p className="text-[10px] text-center mt-6 text-subtle-light max-w-[200px]">
                                    Calcul basé sur votre VMA ({formData.vma} km/h). Améliorez votre vitesse pour augmenter ce score !
                                </p>
                            </>
                        ) : (
                            <div className="text-center opacity-60 py-8">
                                <div className="size-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
                                    <Icon name="monitor_heart" className="text-3xl" />
                                </div>
                                <p className="text-sm font-bold">Données manquantes</p>
                                <p className="text-xs mt-1">Entrez votre VMA pour voir votre VO2 Max</p>
                            </div>
                        )}
                    </div>
                </div>
             </div>
         )}

         {activeTab === 'gear' && (
             <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Mes Chaussures</h3>
                    <button onClick={() => setShowAddShoe(true)} className="text-sm font-bold text-primary flex items-center gap-1"><Icon name="add" /> Ajouter</button>
                </div>

                {showAddShoe && (
                    <div className="mb-6 p-4 bg-background-light dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark animate-in fade-in">
                        <h4 className="font-bold text-sm mb-3">Nouvelle paire</h4>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <input type="text" placeholder="Marque (ex: Nike)" className="px-3 py-2 rounded bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark text-sm" value={newShoe.brand} onChange={e => setNewShoe({...newShoe, brand: e.target.value})} />
                            <input type="text" placeholder="Modèle (ex: Pegasus)" className="px-3 py-2 rounded bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark text-sm" value={newShoe.model} onChange={e => setNewShoe({...newShoe, model: e.target.value})} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowAddShoe(false)} className="px-3 py-1 rounded text-xs font-bold text-subtle-light">Annuler</button>
                            <button onClick={addShoe} className="px-3 py-1 rounded bg-primary text-background-dark text-xs font-bold">Enregistrer</button>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    {shoes.map(shoe => {
                        const percentage = Math.min(100, (shoe.distance / shoe.maxDistance) * 100);
                        const isWorn = percentage > 90;
                        
                        return (
                            <div key={shoe.id} className="p-4 rounded-xl bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark flex gap-4 items-center">
                                <div className="size-12 rounded-full bg-card-light dark:bg-card-dark flex items-center justify-center text-2xl border border-border-light dark:border-border-dark">
                                    👟
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-sm">{shoe.brand} {shoe.name}</span>
                                        <button onClick={() => deleteShoe(shoe.id)} className="text-subtle-light hover:text-red-500"><Icon name="delete" className="text-sm" /></button>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                                        <div className={`h-full rounded-full ${isWorn ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${percentage}%` }}></div>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="font-bold">{shoe.distance} km</span>
                                        <span className="text-subtle-light">Max: {shoe.maxDistance} km</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
             </div>
         )}

         {activeTab === 'preferences' && (
             <div>
                <h3 className="text-lg font-bold mb-4">Paramètres d'application</h3>
                <div className="space-y-4">
                    <label className="flex items-center justify-between p-3 border border-border-light dark:border-border-dark rounded-lg">
                        <span className="text-sm">Mode Sombre (Système)</span>
                        <div className="text-xs text-subtle-light">Auto</div>
                    </label>
                    <label className="flex items-center justify-between p-3 border border-border-light dark:border-border-dark rounded-lg">
                        <span className="text-sm">Notifications</span>
                        <input type="checkbox" defaultChecked className="form-checkbox rounded text-primary focus:ring-primary size-5" />
                    </label>
                     <div className="p-3 border border-border-light dark:border-border-dark rounded-lg">
                         <p className="font-medium text-sm mb-2">Unités</p>
                         <div className="flex gap-4">
                             <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="radio" name="unit" defaultChecked className="text-primary focus:ring-primary" /> km</label>
                             <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="radio" name="unit" className="text-primary focus:ring-primary" /> miles</label>
                         </div>
                     </div>
                </div>
             </div>
         )}
         
         <div className="mt-8 flex flex-col-reverse md:flex-row justify-end gap-3">
            <button onClick={() => alert("Annulé")} className="w-full md:w-auto px-6 py-3 rounded-lg font-bold bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-dark hover:bg-gray-300 transition-colors">Annuler</button>
            <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full md:w-auto px-6 py-3 rounded-lg font-bold bg-primary text-background-dark hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
            >
                {isSaving ? <Icon name="sync" className="animate-spin" /> : <Icon name="save" />}
                {isSaving ? "Enregistrement..." : "Sauvegarder"}
            </button>
         </div>
      </section>
    </div>
  );
};
    
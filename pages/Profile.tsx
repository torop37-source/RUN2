import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { Icon } from '../components/Icon';

export const Profile: React.FC = () => {
  const { user, updateUser } = useUser();
  const [activeTab, setActiveTab] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);

  // Local state for form inputs
  const [formData, setFormData] = useState({
    name: '',
    level: '',
    weight: '',
    height: ''
  });

  useEffect(() => {
    if (user) {
        setFormData({
            name: user.name || '',
            level: user.level || 'Intermédiaire',
            weight: '75', // Placeholder default
            height: '180' // Placeholder default
        });
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
      setFormData(prev => ({...prev, [field]: value}));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
        updateUser({
            name: formData.name,
            level: formData.level
        });
        setIsSaving(false);
        alert("Profil mis à jour avec succès !");
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto pb-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-black mb-2">Mon Profil</h1>
        <p className="text-sm md:text-base text-subtle-light dark:text-subtle-dark">Gérez vos informations personnelles.</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-border-light dark:border-border-dark overflow-x-auto no-scrollbar">
         <div className="flex gap-6 min-w-max">
            <button 
                onClick={() => setActiveTab('personal')}
                className={`pb-3 border-b-2 font-bold text-sm transition-colors ${activeTab === 'personal' ? 'border-primary text-text-light dark:text-text-dark' : 'border-transparent text-subtle-light dark:text-subtle-dark hover:text-text-light'}`}
            >
                Personnel
            </button>
            <button 
                onClick={() => setActiveTab('preferences')}
                className={`pb-3 border-b-2 font-bold text-sm transition-colors ${activeTab === 'preferences' ? 'border-primary text-text-light dark:text-text-dark' : 'border-transparent text-subtle-light dark:text-subtle-dark hover:text-text-light'}`}
            >
                Préférences
            </button>
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
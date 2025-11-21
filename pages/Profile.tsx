import React, { useState } from 'react';
import { Icon } from '../components/Icon';

export const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
        setIsSaving(false);
        alert("Modifications enregistrées avec succès !");
        // Save to localStorage if needed logic here
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto pb-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-3">Mon Profil & Préférences</h1>
        <p className="text-subtle-light dark:text-subtle-dark">Mettez à jour vos informations pour personnaliser votre programme de course.</p>
      </div>

      <div className="mb-8 border-b border-border-light dark:border-border-dark">
         <div className="flex gap-8">
            <button 
                onClick={() => setActiveTab('personal')}
                className={`pb-4 border-b-2 font-bold transition-colors ${activeTab === 'personal' ? 'border-primary text-text-light dark:text-text-dark' : 'border-transparent text-subtle-light dark:text-subtle-dark hover:text-text-light'}`}
            >
                Informations Personnelles
            </button>
            <button 
                onClick={() => setActiveTab('preferences')}
                className={`pb-4 border-b-2 font-bold transition-colors ${activeTab === 'preferences' ? 'border-primary text-text-light dark:text-text-dark' : 'border-transparent text-subtle-light dark:text-subtle-dark hover:text-text-light'}`}
            >
                Préférences du Programme
            </button>
            <button 
                onClick={() => setActiveTab('account')}
                className={`pb-4 border-b-2 font-bold transition-colors ${activeTab === 'account' ? 'border-primary text-text-light dark:text-text-dark' : 'border-transparent text-subtle-light dark:text-subtle-dark hover:text-text-light'}`}
            >
                Compte
            </button>
         </div>
      </div>

      <section className="p-8 rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark animate-in fade-in duration-300">
         {activeTab === 'personal' && (
             <div>
                <h3 className="text-xl font-bold mb-6">Informations Personnelles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex flex-col gap-2">
                    <span className="font-medium">Prénom</span>
                    <input type="text" defaultValue="Jean" className="form-input h-12 px-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none" />
                    </label>
                    <label className="flex flex-col gap-2">
                    <span className="font-medium">Nom</span>
                    <input type="text" defaultValue="Dupont" className="form-input h-12 px-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none" />
                    </label>
                    <label className="flex flex-col gap-2">
                    <span className="font-medium">Âge</span>
                    <input type="number" defaultValue="30" className="form-input h-12 px-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none" />
                    </label>
                    <label className="flex flex-col gap-2">
                    <span className="font-medium">Genre</span>
                    <select className="form-select h-12 px-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none">
                        <option>Homme</option>
                        <option>Femme</option>
                        <option>Autre</option>
                    </select>
                    </label>
                    <label className="flex flex-col gap-2">
                    <span className="font-medium">Poids (kg)</span>
                    <input type="number" defaultValue="75" className="form-input h-12 px-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none" />
                    </label>
                    <label className="flex flex-col gap-2">
                    <span className="font-medium">Taille (cm)</span>
                    <input type="number" defaultValue="180" className="form-input h-12 px-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none" />
                    </label>
                </div>
             </div>
         )}

         {activeTab === 'preferences' && (
             <div>
                <h3 className="text-xl font-bold mb-6">Préférences d'entraînement</h3>
                <div className="space-y-6">
                    <label className="flex items-center justify-between p-4 border border-border-light dark:border-border-dark rounded-lg">
                        <span>Recevoir des rappels par email</span>
                        <input type="checkbox" defaultChecked className="form-checkbox rounded text-primary focus:ring-primary size-5" />
                    </label>
                    <label className="flex items-center justify-between p-4 border border-border-light dark:border-border-dark rounded-lg">
                        <span>Synchroniser avec le calendrier</span>
                        <input type="checkbox" className="form-checkbox rounded text-primary focus:ring-primary size-5" />
                    </label>
                     <div className="p-4 border border-border-light dark:border-border-dark rounded-lg">
                         <p className="font-medium mb-2">Unités de distance</p>
                         <div className="flex gap-4">
                             <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="unit" defaultChecked className="text-primary focus:ring-primary" /> Kilomètres (km)</label>
                             <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="unit" className="text-primary focus:ring-primary" /> Miles (mi)</label>
                         </div>
                     </div>
                </div>
             </div>
         )}

         {activeTab === 'account' && (
             <div>
                 <h3 className="text-xl font-bold mb-6">Paramètres du compte</h3>
                 <div className="space-y-4">
                     <button className="w-full text-left p-4 border border-border-light dark:border-border-dark rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors font-medium">
                         Changer le mot de passe
                     </button>
                     <button className="w-full text-left p-4 border border-red-200 dark:border-red-900/30 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-medium text-red-500">
                         Supprimer mon compte
                     </button>
                 </div>
             </div>
         )}
         
         <div className="mt-10 flex justify-end gap-4">
            <button onClick={() => alert("Modifications annulées.")} className="px-6 py-3 rounded-lg font-bold bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-dark hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Annuler</button>
            <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 rounded-lg font-bold bg-primary text-background-dark hover:opacity-90 transition-opacity flex items-center gap-2"
            >
                {isSaving ? "Enregistrement..." : "Enregistrer"}
            </button>
         </div>
      </section>
    </div>
  );
};
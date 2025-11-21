import React, { useState } from 'react';
import { Icon } from '../components/Icon';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const speedData = [
  { name: 'Lun', speed: 5.20 },
  { name: 'Mar', speed: 5.25 },
  { name: 'Mer', speed: 5.15 },
  { name: 'Jeu', speed: 5.30 },
  { name: 'Ven', speed: 5.22 },
  { name: 'Sam', speed: 5.18 },
  { name: 'Dim', speed: 5.28 },
];

export const History: React.FC = () => {
  const [filter, setFilter] = useState<'week' | 'month' | 'year'>('week');

  const activeClass = "bg-primary/20 text-text-light dark:text-text-dark ring-1 ring-primary/50";
  const inactiveClass = "bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark hover:bg-primary/10";

  const handleDetailsClick = (date: string) => {
    alert(`Détails de la course du ${date} bientôt disponibles.`);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-8">
      {/* Page Heading */}
      <div className="flex flex-wrap justify-between gap-4 items-center mb-2">
        <div className="flex flex-col gap-1">
          <p className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] text-text-light dark:text-text-dark">Mon Historique</p>
          <p className="text-base font-normal leading-normal text-subtle-light dark:text-subtle-dark">Visualisez vos progrès et restez motivé.</p>
        </div>
        {/* Date Range Picker Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button 
            onClick={() => setFilter('week')}
            className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 transition-all ${filter === 'week' ? activeClass : inactiveClass}`}
          >
            <p className="text-sm font-medium leading-normal">Cette semaine</p>
          </button>
          <button 
            onClick={() => setFilter('month')}
            className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 transition-all ${filter === 'month' ? activeClass : inactiveClass}`}
          >
            <p className="text-sm font-medium leading-normal">Ce mois-ci</p>
          </button>
          <button 
            onClick={() => setFilter('year')}
            className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 transition-all ${filter === 'year' ? activeClass : inactiveClass}`}
          >
            <p className="text-sm font-medium leading-normal">Cette année</p>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Distance totale", value: "78.2 km", trend: "+5.2%", trendUp: true },
          { label: "Temps total", value: "6h 45min", trend: "+3.1%", trendUp: true },
          { label: "Vitesse moyenne", value: "5:28 min/km", trend: "-1.5%", trendUp: false }, // Faster pace is technically down in minutes
          { label: "Courses", value: "12", trend: "+2", trendUp: true },
        ].map((stat, idx) => (
          <div key={idx} className="flex flex-col gap-2 rounded-xl p-6 border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark hover:shadow-sm transition-shadow">
            <p className="text-base font-medium text-subtle-light dark:text-subtle-dark">{stat.label}</p>
            <p className="tracking-tight text-3xl font-bold text-text-light dark:text-text-dark">{stat.value}</p>
            <div className={`flex items-center gap-1 text-sm font-bold ${stat.trendUp ? 'text-green-600 dark:text-green-400' : 'text-primary dark:text-green-400'}`}>
               <Icon name={stat.trendUp ? "trending_up" : "trending_down"} className="text-lg" />
               {stat.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-3 flex flex-col gap-2 rounded-xl border border-border-light dark:border-border-dark p-6 bg-card-light dark:bg-card-dark h-96">
          <div className="mb-4">
             <p className="text-base font-medium text-text-light dark:text-text-dark">Progression de la Vitesse</p>
             <p className="text-3xl font-bold">5:28 min/km</p>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={speedData}>
              <defs>
                <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#13ec5b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#13ec5b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#9CA3AF" axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a2c20', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#13ec5b' }}
              />
              <Line type="monotone" dataKey="speed" stroke="#13ec5b" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart Mockup */}
        <div className="lg:col-span-2 flex flex-col gap-2 rounded-xl border border-border-light dark:border-border-dark p-6 bg-card-light dark:bg-card-dark h-96">
           <div className="mb-4">
             <p className="text-base font-medium text-text-light dark:text-text-dark">Répartition</p>
             <p className="text-3xl font-bold">12 Courses</p>
          </div>
          <div className="flex h-full items-end justify-around pb-4 gap-4">
             <div className="w-16 bg-primary/30 hover:bg-primary/50 transition-colors rounded-t-lg relative group cursor-pointer" style={{height: '60%'}}>
               <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">60%</span>
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-8 text-xs font-bold">Endurance</div>
             </div>
             <div className="w-16 bg-primary/30 hover:bg-primary/50 transition-colors rounded-t-lg relative group cursor-pointer" style={{height: '30%'}}>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">30%</span>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-8 text-xs font-bold">Fractionné</div>
             </div>
             <div className="w-16 bg-primary/30 hover:bg-primary/50 transition-colors rounded-t-lg relative group cursor-pointer" style={{height: '10%'}}>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">10%</span>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-8 text-xs font-bold">Récup.</div>
             </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark overflow-hidden">
        <div className="p-6 border-b border-border-light dark:border-border-dark">
          <h3 className="text-lg font-bold">Historique des Courses</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-background-light dark:bg-background-dark/50 text-xs uppercase text-subtle-light dark:text-subtle-dark">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Distance</th>
                <th className="px-6 py-3 font-medium">Durée</th>
                <th className="px-6 py-3 font-medium">Vitesse</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              <tr className="hover:bg-primary/5 transition-colors cursor-pointer">
                <td className="px-6 py-4 font-medium">23 Fév 2024</td>
                <td className="px-6 py-4">Endurance</td>
                <td className="px-6 py-4">10.2 km</td>
                <td className="px-6 py-4">55:12</td>
                <td className="px-6 py-4">5:25 min/km</td>
                <td className="px-6 py-4 text-right"><button onClick={() => handleDetailsClick('23 Fév')} className="text-primary font-bold hover:underline">Détails</button></td>
              </tr>
              <tr className="hover:bg-primary/5 transition-colors cursor-pointer">
                <td className="px-6 py-4 font-medium">21 Fév 2024</td>
                <td className="px-6 py-4">Fractionné</td>
                <td className="px-6 py-4">8.0 km</td>
                <td className="px-6 py-4">42:30</td>
                <td className="px-6 py-4">5:18 min/km</td>
                <td className="px-6 py-4 text-right"><button onClick={() => handleDetailsClick('21 Fév')} className="text-primary font-bold hover:underline">Détails</button></td>
              </tr>
              <tr className="hover:bg-primary/5 transition-colors cursor-pointer">
                <td className="px-6 py-4 font-medium">19 Fév 2024</td>
                <td className="px-6 py-4">Récupération</td>
                <td className="px-6 py-4">5.1 km</td>
                <td className="px-6 py-4">30:05</td>
                <td className="px-6 py-4">5:55 min/km</td>
                <td className="px-6 py-4 text-right"><button onClick={() => handleDetailsClick('19 Fév')} className="text-primary font-bold hover:underline">Détails</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
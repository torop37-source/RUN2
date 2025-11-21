import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './pages/Dashboard';
import { ProgramDetails } from './pages/ProgramDetails';
import { CreateProgram } from './pages/CreateProgram';
import { History } from './pages/History';
import { Profile } from './pages/Profile';
import { Icon } from './components/Icon';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
           {/* Mobile Header (Minimalist) */}
           <header className="lg:hidden flex items-center justify-center p-4 bg-background-light dark:bg-background-dark sticky top-0 z-30">
              <div className="flex items-center gap-2">
                 <Icon name="directions_run" className="text-primary text-2xl" filled />
                 <span className="font-black text-lg tracking-tight">RunFlow</span>
              </div>
           </header>

           {/* Main Content Area - padding bottom added for BottomNav */}
           <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 scroll-smooth">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/program" element={<ProgramDetails />} />
                <Route path="/create" element={<CreateProgram />} />
                <Route path="/history" element={<History />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
           </main>

           <BottomNav />
        </div>
      </div>
    </Router>
  );
};

export default App;
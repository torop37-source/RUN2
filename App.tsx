
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './pages/Dashboard';
import { ProgramDetails } from './pages/ProgramDetails';
import { CreateProgram } from './pages/CreateProgram';
import { History } from './pages/History';
import { Profile } from './pages/Profile';
import { Coach } from './pages/Coach';
import { Icon } from './components/Icon';
import { UserProvider } from './contexts/UserContext';

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <div className="flex h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark overflow-hidden">
          <Sidebar />
          
          <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
             {/* Mobile Header (Minimalist) */}
             <header className="lg:hidden flex items-center justify-between p-4 bg-background-light dark:bg-background-dark sticky top-0 z-30 border-b border-border-light dark:border-border-dark">
                <div className="flex items-center gap-2">
                   <Icon name="directions_run" className="text-primary text-2xl" filled />
                   <span className="font-black text-lg tracking-tight">RunFlow</span>
                </div>
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                   <Icon name="notifications" className="text-primary text-sm" />
                </div>
             </header>
  
             {/* Main Content Area - PB-28 ensures content isn't hidden behind BottomNav */}
             <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-28 md:pb-8 scroll-smooth">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/program" element={<ProgramDetails />} />
                  <Route path="/create" element={<CreateProgram />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/coach" element={<Coach />} />
                </Routes>
             </main>
  
             <BottomNav />
          </div>
        </div>
      </Router>
    </UserProvider>
  );
};

export default App;

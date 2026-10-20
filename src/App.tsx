import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { DesktopHeader, BottomNav } from './components/navigation/Navigation';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { ReportItemPage } from './pages/ReportItemPage';
import { ItemDetailsPage } from './pages/ItemDetailsPage';
import { DashboardPage } from './pages/DashboardPage';
import { ActivityPage } from './pages/ActivityPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#F6F7FB] flex flex-col text-[#172033]">
          {/* Desktop & Tablet Top Header */}
          <DesktopHeader />

          {/* Main Application Routes Viewport */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/report" element={<ReportItemPage />} />
              <Route path="/item/:id" element={<ItemDetailsPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Routes>
          </main>

          {/* Mobile Bottom Navigation (Visible under 768px) */}
          <BottomNav />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;

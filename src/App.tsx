import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { DesktopHeader, BottomNav } from './components/navigation/Navigation';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { ReportItemPage } from './pages/ReportItemPage';
import { ItemDetailsPage } from './pages/ItemDetailsPage';
import { DashboardPage } from './pages/DashboardPage';
import { ActivityPage } from './pages/ActivityPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AuthModalPage } from './pages/LoginPage';

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, activeRole } = useApp();

  // If not logged in or role is 'student', block access and redirect
  const isAdminOrStaff = isAuthenticated && (activeRole === 'admin' || activeRole === 'security_staff' || user.role === 'admin' || user.role === 'security_staff');

  if (!isAdminOrStaff) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-900">
          {/* Desktop & Tablet Top Header */}
          <DesktopHeader />

          {/* Main Application Routes Viewport */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<AuthModalPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/report" element={<ReportItemPage />} />
              <Route path="/item/:id" element={<ItemDetailsPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboardPage />
                  </ProtectedAdminRoute>
                }
              />
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

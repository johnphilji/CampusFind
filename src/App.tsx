import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

/**
 * Wrapper that conditionally hides the student navigation
 * when the admin dashboard is active. The admin panel has its
 * own header and doesn't need the student chrome.
 */
const AppShell: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-900">
      {/* Hide student navigation on admin routes */}
      {!isAdminRoute && <DesktopHeader />}

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

      {/* Hide mobile bottom nav on admin routes */}
      {!isAdminRoute && <BottomNav />}
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './components/common/Toast';
import { Navbar } from './components/common/Navbar';
import { BottomNav } from './components/common/BottomNav';
import { AdminSidebar } from './components/common/AdminSidebar';
import { AdminHeader } from './components/common/AdminHeader';
import { Footer } from './components/common/Footer';
import { AITripGeneratorModal } from './components/ai/AITripGeneratorModal';
import { AuthModal } from './components/auth/AuthModal';

// User Pages
import { HomePage } from './pages/user/Home/HomePage';
import { ExplorePage } from './pages/user/Explore/ExplorePage';
import { CommunityPage } from './pages/user/Community/CommunityPage';
import { ItineraryManagerPage } from './pages/user/Itineraries/ItineraryManagerPage';
import { AIPlannerPage } from './pages/user/AIPlanner/AIPlannerPage';
import { MessagesPage } from './pages/user/Messages/MessagesPage';
import { ProfilePage } from './pages/user/Profile/ProfilePage';
import { NotificationsPage } from './pages/user/Notifications/NotificationsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/Dashboard/AdminDashboardPage';
import { AdminPlacesPage } from './pages/admin/Places/AdminPlacesPage';
import { AdminUsersPage } from './pages/admin/Users/AdminUsersPage';
import { AdminReportsPage } from './pages/admin/Reports/AdminReportsPage';
import { AdminRevenuePage } from './pages/admin/Revenue/AdminRevenuePage';
import { AdminStatisticsPage } from './pages/admin/Statistics/AdminStatisticsPage';
import { AdminAIConfigPage } from './pages/admin/AIConfig/AdminAIConfigPage';

const AppContent = () => {
  const { portalMode, userTab, adminTab } = useApp();

  const renderUserPage = () => {
    switch (userTab) {
      case 'home': return <HomePage />;
      case 'explore': return <ExplorePage />;
      case 'community': return <CommunityPage />;
      case 'itineraries': return <ItineraryManagerPage />;
      case 'ai-planner': return <AIPlannerPage />;
      case 'messages': return <MessagesPage />;
      case 'profile': return <ProfilePage />;
      case 'notifications': return <NotificationsPage />;
      default: return <HomePage />;
    }
  };

  const renderAdminPage = () => {
    switch (adminTab) {
      case 'dashboard': return <AdminDashboardPage />;
      case 'places': return <AdminPlacesPage />;
      case 'users': return <AdminUsersPage />;
      case 'reports': return <AdminReportsPage />;
      case 'analytics': return <AdminStatisticsPage />;
      case 'revenue': return <AdminRevenuePage />;
      case 'ai-config': return <AdminAIConfigPage />;
      default: return <AdminDashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] font-sans text-slate-900 selection:bg-sky-500 selection:text-white">
      {portalMode === 'user' ? (
        <div className="min-h-screen flex flex-col pb-20 md:pb-0">
          {/* User Navbar */}
          <Navbar />

          {/* User Main View */}
          <main className="flex-1">
            {renderUserPage()}
          </main>

          {/* Mobile Bottom Navigation */}
          <BottomNav />

          {/* User Footer */}
          <Footer />
        </div>
      ) : (
        <div className="min-h-screen bg-[#faf8ff]">
          {/* Admin Fixed Sidebar (260px) */}
          <div className="hidden md:block"><AdminSidebar /></div>

          {/* Admin Fixed Top Header */}
          <AdminHeader />

          {/* Admin Main Workspace Container */}
          <div className="min-w-0 md:pl-[260px] pt-16 min-h-screen">
            <main className="min-w-0 p-4 sm:p-6 lg:p-8 bg-[#faf8ff] min-h-[calc(100vh-64px)]">
              {renderAdminPage()}
            </main>
          </div>
        </div>
      )}

      {/* Global Overlays & Modals */}
      <AITripGeneratorModal />
      <AuthModal />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AppProvider>
  );
}

export default App;

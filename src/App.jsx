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

// Admin Pages
import { AdminDashboardPage } from './pages/admin/Dashboard/AdminDashboardPage';
import { AdminPlacesPage } from './pages/admin/Places/AdminPlacesPage';
import { AdminUsersPage } from './pages/admin/Users/AdminUsersPage';
import { AdminReportsPage } from './pages/admin/Reports/AdminReportsPage';

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
      default: return <HomePage />;
    }
  };

  const renderAdminPage = () => {
    switch (adminTab) {
      case 'dashboard': return <AdminDashboardPage />;
      case 'places': return <AdminPlacesPage />;
      case 'users': return <AdminUsersPage />;
      case 'reports': return <AdminReportsPage />;
      case 'analytics': return <AdminDashboardPage />;
      case 'ai-config': return <AdminDashboardPage />;
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
          <AdminSidebar />

          {/* Admin Fixed Top Header */}
          <AdminHeader />

          {/* Admin Main Workspace Container */}
          <div className="pl-[260px] pt-16 min-h-screen">
            <main className="p-6 sm:p-8 bg-[#faf8ff] min-h-[calc(100vh-64px)]">
              {renderAdminPage()}
            </main>
          </div>
        </div>
      )}

      {/* Global AI Generator Wizard Modal */}
      <AITripGeneratorModal />

      {/* Global Stitch Auth01 Login & Register Modal */}
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ToastProvider>
  );
}

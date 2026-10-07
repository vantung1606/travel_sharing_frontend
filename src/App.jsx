import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './components/common/Toast';
import { Navbar } from './components/common/Navbar';
import { BottomNav } from './components/common/BottomNav';
import { AdminSidebar } from './components/common/AdminSidebar';
import { AdminHeader } from './components/common/AdminHeader';
import { Footer } from './components/common/Footer';
import { AITripGeneratorModal } from './components/ai/AITripGeneratorModal';
import { AuthModal } from './components/auth/AuthModal';
import { PageTitleManager, AdminRouteGuard, UserAuthGuard } from './components/common/RouteGuards';

// User Pages
import { HomePage } from './pages/user/Home/HomePage';
import { ExplorePage } from './pages/user/Explore/ExplorePage';
import { CommunityPage } from './pages/user/Community/CommunityPage';
import { ItineraryManagerPage } from './pages/user/Itineraries/ItineraryManagerPage';
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
import { AdminAuditLogsPage } from './pages/admin/AuditLogs/AdminAuditLogsPage';
import { AdminAIConfigPage } from './pages/admin/AIConfig/AdminAIConfigPage';

const AppContent = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-sky-600 selection:text-white">
      {/* Dynamic Title Manager for Browser Tab */}
      <PageTitleManager />

      {!isAdminPath ? (
        /* USER PORTAL LAYOUT */
        <div className="min-h-screen flex flex-col pb-20 md:pb-0">
          <Navbar />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/ai-planner" element={<Navigate to="/itineraries" replace />} />
              
              {/* Protected User Routes */}
              <Route 
                path="/itineraries" 
                element={
                  <UserAuthGuard title="Lịch trình của tôi">
                    <ItineraryManagerPage />
                  </UserAuthGuard>
                } 
              />
              <Route 
                path="/messages" 
                element={
                  <UserAuthGuard title="Hộp thư & Trò chuyện chuyến đi">
                    <MessagesPage />
                  </UserAuthGuard>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <UserAuthGuard title="Trang Hồ sơ cá nhân">
                    <ProfilePage />
                  </UserAuthGuard>
                } 
              />
              <Route 
                path="/notifications" 
                element={
                  <UserAuthGuard title="Trung tâm Thông báo">
                    <NotificationsPage />
                  </UserAuthGuard>
                } 
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <BottomNav />
          <Footer />
        </div>
      ) : (
        /* ADMIN PORTAL SECURED LAYOUT */
        <AdminRouteGuard>
          <div className="min-h-screen bg-[#faf8ff]">
            {/* Fixed Sidebar */}
            <div className="hidden md:block">
              <AdminSidebar />
            </div>

            {/* Fixed Top Header */}
            <AdminHeader />

            {/* Admin Workspace Content */}
            <div className="min-w-0 md:pl-[260px] pt-16 min-h-screen">
              <main className="min-w-0 p-4 sm:p-6 lg:p-8 bg-[#faf8ff] min-h-[calc(100vh-64px)]">
                <Routes>
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="/admin/places" element={<AdminPlacesPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/reports" element={<AdminReportsPage />} />
                  <Route path="/admin/analytics" element={<AdminStatisticsPage />} />
                  <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
                  <Route path="/admin/revenue" element={<AdminRevenuePage />} />
                  <Route path="/admin/ai-config" element={<AdminAIConfigPage />} />
                  <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        </AdminRouteGuard>
      )}

      {/* Global Overlays & Modals */}
      <AITripGeneratorModal />
      <AuthModal />
    </div>
  );
};

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[GlobalErrorBoundary] Caught render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-sm">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Hệ thống đang tự phục hồi hiển thị</h2>
          <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
            Một thành phần vừa gặp sự cố tải dữ liệu tạm thời. Bạn có thể nhấn tải lại hoặc quay về trang chủ.
          </p>
          <div className="flex items-center gap-3 justify-center">
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = '/';
              }}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm"
            >
              Về Trang chủ
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-sm rounded-xl transition-all"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  return (
    <GlobalErrorBoundary>
      <AppProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AppProvider>
    </GlobalErrorBoundary>
  );
}

export default App;

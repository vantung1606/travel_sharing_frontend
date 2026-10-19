import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider, useToast } from './components/common/Toast';
import { chatSocket } from './services/chatSocket';
import { Navbar } from './components/common/Navbar';
import { BottomNav } from './components/common/BottomNav';
import { AdminSidebar } from './components/common/AdminSidebar';
import { AdminHeader } from './components/common/AdminHeader';
import { Footer } from './components/common/Footer';
import { AITripGeneratorModal } from './components/ai/AITripGeneratorModal';
import { AuthModal } from './components/auth/AuthModal';
import { FloatingChatWidget } from './components/common/FloatingChatWidget';
import { PageTitleManager, AdminRouteGuard, UserAuthGuard } from './components/common/RouteGuards';

// User Pages - lazy loaded để tách bundle theo route (giảm thời gian tải trang đầu)
const HomePage = lazy(() => import('./pages/user/Home/HomePage').then(m => ({ default: m.HomePage })));
const ExplorePage = lazy(() => import('./pages/user/Explore/ExplorePage').then(m => ({ default: m.ExplorePage })));
const PlaceDetailPage = lazy(() => import('./pages/user/Explore/PlaceDetailPage'));
const CommunityPage = lazy(() => import('./pages/user/Community/CommunityPage').then(m => ({ default: m.CommunityPage })));
const ItineraryManagerPage = lazy(() => import('./pages/user/Itineraries/ItineraryManagerPage').then(m => ({ default: m.ItineraryManagerPage })));
const MessagesPage = lazy(() => import('./pages/user/Messages/MessagesPage').then(m => ({ default: m.MessagesPage })));
const ProfilePage = lazy(() => import('./pages/user/Profile/ProfilePage').then(m => ({ default: m.ProfilePage })));
const NotificationsPage = lazy(() => import('./pages/user/Notifications/NotificationsPage').then(m => ({ default: m.NotificationsPage })));

// Admin Pages - lazy loaded, chỉ tải khi vào khu vực /admin
const AdminDashboardPage = lazy(() => import('./pages/admin/Dashboard/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminPlacesPage = lazy(() => import('./pages/admin/Places/AdminPlacesPage').then(m => ({ default: m.AdminPlacesPage })));
const AdminUsersPage = lazy(() => import('./pages/admin/Users/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminReportsPage = lazy(() => import('./pages/admin/Reports/AdminReportsPage').then(m => ({ default: m.AdminReportsPage })));
const AdminRevenuePage = lazy(() => import('./pages/admin/Revenue/AdminRevenuePage').then(m => ({ default: m.AdminRevenuePage })));
const AdminStatisticsPage = lazy(() => import('./pages/admin/Statistics/AdminStatisticsPage').then(m => ({ default: m.AdminStatisticsPage })));
const AdminAuditLogsPage = lazy(() => import('./pages/admin/AuditLogs/AdminAuditLogsPage').then(m => ({ default: m.AdminAuditLogsPage })));
const AdminAIConfigPage = lazy(() => import('./pages/admin/AIConfig/AdminAIConfigPage').then(m => ({ default: m.AdminAIConfigPage })));

// Fallback hiển thị trong lúc tải chunk của route
const RouteLoadingFallback = () => (
  <div className="flex min-h-[50vh] w-full items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-sky-200 border-t-sky-600" />
      <span className="text-xs font-semibold text-slate-500">Đang tải trang...</span>
    </div>
  </div>
);

const AppContent = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const { isLoggedIn, currentUser, addNewNotification } = useApp();
  const toast = useToast();
  const recentNotifKeysRef = useRef(new Set());

  // Đăng ký nhận thông báo Real-time qua STOMP WebSocket
  useEffect(() => {
    if (!isLoggedIn || !currentUser?.email) return;

    const unsubscribe = chatSocket.subscribeToNotifications(
      currentUser.id,
      currentUser.email,
      (notification) => {
        if (!notification) return;

        // 1. Chống trùng lặp thông báo (Deduplication trong 4 giây)
        const notifKey = notification.id
          ? String(notification.id)
          : `${notification.type}_${notification.message}`;
        if (recentNotifKeysRef.current.has(notifKey)) return;
        recentNotifKeysRef.current.add(notifKey);
        setTimeout(() => recentNotifKeysRef.current.delete(notifKey), 4000);

        addNewNotification(notification);

        // 2. Không làm phiền người dùng bằng Toast nếu đang ở màn hình chat (/messages)
        const isChatNotification = notification.type === 'CHAT_MESSAGE';
        const isOnMessagesPage = window.location.pathname.startsWith('/messages');
        if (isChatNotification && isOnMessagesPage) {
          return;
        }

        // Hiển thị Toast nổi thông báo tức thời
        const title = notification.title || 'Thông báo';
        const msg = notification.message || 'Bạn có thông báo mới';
        toast.showInfo(`🔔 ${title}: ${msg}`, 4000);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isLoggedIn, currentUser?.id, currentUser?.email, addNewNotification, toast]);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-sky-600 selection:text-white">
      {/* Dynamic Title Manager for Browser Tab */}
      <PageTitleManager />

      {!isAdminPath ? (
        /* USER PORTAL LAYOUT */
        <div className="min-h-screen flex flex-col pb-20 md:pb-0">
          <Navbar />

          <main className="flex-1">
            <Suspense fallback={<RouteLoadingFallback />}>
              <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/places/:placeId" element={<PlaceDetailPage />} />
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
            </Suspense>
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
                <Suspense fallback={<RouteLoadingFallback />}>
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
                </Suspense>
              </main>
            </div>
          </div>
        </AdminRouteGuard>
      )}

      {/* Global Overlays & Modals */}
      <AITripGeneratorModal />
      <AuthModal />
      {!isAdminPath && <FloatingChatWidget />}
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

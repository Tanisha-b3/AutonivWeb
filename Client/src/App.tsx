import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './hooks/useStore';
import { logout, checkAuth, login as loginAction, register as registerAction } from './store/slices/authSlice';
import { useEffect, lazy, Suspense, type ReactNode } from 'react';
import { Sidebar } from './components/Sidebar';
import { Breadcrumbs } from './components/Breadcrumbs';
import LoadingScreen from './components/LoadingScreen';
// import AIAssistantChat from './components/AIAssistantChat';

const Landing             = lazy(() => import('./pages/public/Landing').then(m => ({ default: m.Landing })));
const UserDashboard       = lazy(() => import('./pages/user/UserDashboard').then(m => ({ default: m.UserDashboard })));
const ForgotPassword      = lazy(() => import('./pages/public/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const PrivacyPolicy       = lazy(() => import('./pages/public/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsConditions     = lazy(() => import('./pages/public/TermsConditions').then(m => ({ default: m.TermsConditions })));
const HelpCenter          = lazy(() => import('./pages/public/HelpCenter').then(m => ({ default: m.HelpCenter })));
const AboutUs             = lazy(() => import('./pages/public/AboutUs').then(m => ({ default: m.AboutUs })));
const Careers             = lazy(() => import('./pages/public/Careers').then(m => ({ default: m.Careers })));
const Blog                = lazy(() => import('./pages/public/Blog').then(m => ({ default: m.Blog })));
const Press               = lazy(() => import('./pages/public/Press').then(m => ({ default: m.Press })));
const MyAgents            = lazy(() => import('./pages/user/MyAgents').then(m => ({ default: m.MyAgents })));
const MyCalls             = lazy(() => import('./pages/user/MyCalls').then(m => ({ default: m.MyCalls })));
const MyLeads             = lazy(() => import('./pages/user/MyLeads').then(m => ({ default: m.MyLeads })));
const UserBilling         = lazy(() => import('./pages/user/UserBilling').then(m => ({ default: m.UserBilling })));
const MyAddOns            = lazy(() => import('./pages/user/MyAddOns').then(m => ({ default: m.MyAddOns })));
const MyAppointments      = lazy(() => import('./pages/user/MyAppointments').then(m => ({ default: m.MyAppointments })));
const MyChat              = lazy(() => import('./pages/user/MyChat').then(m => ({ default: m.MyChat })));
const AdminDashboard      = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminUsers          = lazy(() => import('./pages/admin/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminAgents         = lazy(() => import('./pages/admin/AdminAgents').then(m => ({ default: m.AdminAgents })));
const AdminCalls          = lazy(() => import('./pages/admin/AdminCalls').then(m => ({ default: m.AdminCalls })));
const AdminBilling        = lazy(() => import('./pages/admin/AdminBilling').then(m => ({ default: m.AdminBilling })));
const AdminLeads          = lazy(() => import('./pages/admin/AdminLeads').then(m => ({ default: m.AdminLeads })));
const AdminUpgradeRequests = lazy(() => import('./pages/admin/AdminUpgradeRequests').then(m => ({ default: m.AdminUpgradeRequests })));
const AdminAddOns         = lazy(() => import('./pages/admin/AdminAddOns').then(m => ({ default: m.AdminAddOns })));
const AdminAppointments   = lazy(() => import('./pages/admin/AdminAppointments').then(m => ({ default: m.AdminAppointments })));
const AdminChat           = lazy(() => import('./pages/admin/AdminChat').then(m => ({ default: m.AdminChat })));
const WelcomeOnboarding   = lazy(() => import('./components/WelcomeOnboarding').then(m => ({ default: m.default })));

export function useAuth() {
  const dispatch    = useAppDispatch();
  const user        = useAppSelector((s) => s.auth.user);
  const loading     = useAppSelector((s) => s.auth.loading);
  const initialized = useAppSelector((s) => s.auth.initialized);
  const token       = useAppSelector((s) => s.auth.token);

  useEffect(() => {
    // Only hit the server if we actually have a token to validate
    if (token && !initialized) {
      dispatch(checkAuth());
    }
  }, [token, initialized, dispatch]);

  const login = async (email: string, password: string) => {
    const result = await dispatch(loginAction({ email, password })).unwrap();
    return result;
  };

  const register = async (data: { name: string; email: string; password: string; company?: string; phoneNumber?: string }) => {
    const result = await dispatch(registerAction(data)).unwrap();
    return result;
  };

  return {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout: () => dispatch(logout()),
  };
}

function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { user, isAdmin } = useAuth();
  const initialized = useAppSelector((s) => s.auth.initialized);
  const token       = useAppSelector((s) => s.auth.token);

  // Still waiting on server validation of an existing token
  if (token && !initialized) return <LoadingScreen />;

  if (!user) return <Navigate to="/" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <header
          className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 h-14 shrink-0"
          style={{ background: 'rgba(248,250,252,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e2e8f0' }}
        >
          <div className="w-10" />
          <div className="flex-1 min-w-0"><Breadcrumbs /></div>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8 md:mt-4 overflow-y-auto">
          <div className="hidden md:block"><Breadcrumbs /></div>
          {children}
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user }    = useAuth();
  const initialized = useAppSelector((s) => s.auth.initialized);
  const token       = useAppSelector((s) => s.auth.token);

  // Only block render if we have a token but haven't validated it yet
  if (token && !initialized) return <LoadingScreen />;

  const home = user
    ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
    : <Landing />;

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/"         element={home} />
        <Route path="/login"    element={home} />
        <Route path="/register" element={home} />
        <Route path="/onboarding" element={<ProtectedRoute><WelcomeOnboarding onComplete={() => {}} /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/press" element={<Press />} />

        <Route path="/dashboard"              element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/agents"       element={<ProtectedRoute><MyAgents /></ProtectedRoute>} />
        <Route path="/dashboard/calls"        element={<ProtectedRoute><MyCalls /></ProtectedRoute>} />
        <Route path="/dashboard/leads"        element={<ProtectedRoute><MyLeads /></ProtectedRoute>} />
        <Route path="/dashboard/appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
        <Route path="/dashboard/chat" element={<ProtectedRoute><MyChat /></ProtectedRoute>} />
        <Route path="/dashboard/billing"      element={<ProtectedRoute><UserBilling /></ProtectedRoute>} />
        <Route path="/dashboard/add-ons"      element={<ProtectedRoute><MyAddOns /></ProtectedRoute>} />

        <Route path="/admin"                    element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users"              element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/agents"             element={<ProtectedRoute adminOnly><AdminAgents /></ProtectedRoute>} />
        <Route path="/admin/calls"              element={<ProtectedRoute adminOnly><AdminCalls /></ProtectedRoute>} />
        <Route path="/admin/leads"              element={<ProtectedRoute adminOnly><AdminLeads /></ProtectedRoute>} />
        <Route path="/admin/appointments"       element={<ProtectedRoute adminOnly><AdminAppointments /></ProtectedRoute>} />
        <Route path="/admin/billing"            element={<ProtectedRoute adminOnly><AdminBilling /></ProtectedRoute>} />
        <Route path="/admin/upgrade-requests"   element={<ProtectedRoute adminOnly><AdminUpgradeRequests /></ProtectedRoute>} />
        <Route path="/admin/add-ons"            element={<ProtectedRoute adminOnly><AdminAddOns /></ProtectedRoute>} />
        <Route path="/admin/chat"               element={<ProtectedRoute adminOnly><AdminChat /></ProtectedRoute>} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      {/* <AIAssistantChat />  */}
         </BrowserRouter>
  );
}
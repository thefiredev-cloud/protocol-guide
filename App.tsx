
import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Browse from './pages/Browse';
import ProtocolDetail from './pages/ProtocolDetail';
import Chat from './pages/Chat';
import Account from './pages/Account';
import Hospitals from './pages/Hospitals';
import Login from './pages/Login';
import Admin from './pages/Admin';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { WidgetModeProvider, useWidgetMode } from './contexts/WidgetModeContext';
import { VoiceInputProvider } from './contexts/VoiceInputContext';
import { WidgetButton, WidgetContainer } from './components/Widget';
import OfflineIndicator from './components/OfflineIndicator';

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: ErrorBoundaryProps;
  state: ErrorBoundaryState = { hasError: false };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-background-dark flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#9B1B30]/20 dark:bg-[#9B1B30]/30 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">The app encountered an unexpected error.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-[#7A1628] transition-colors"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Live time status bar
const StatusBar = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="h-12 w-full flex items-center justify-between px-6 text-sm font-medium z-50 fixed top-0 left-0 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm pointer-events-none border-b border-transparent dark:border-slate-800/50">
      <span className="dark:text-white">{formattedTime}</span>
      <div className="flex gap-1.5 items-center dark:text-white">
        <span className="material-symbols-outlined text-[18px]">signal_cellular_alt</span>
        <span className="material-symbols-outlined text-[18px]">wifi</span>
        <span className="material-symbols-outlined text-[18px] rotate-90">battery_full</span>
      </div>
    </div>
  );
};

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-200">
      <StatusBar />
      <OfflineIndicator />
      <div className="pt-safe-top pt-12 pb-safe-bottom">
        {children}
      </div>
      <BottomNav />
    </div>
  );
};

// Widget-aware layout - shows collapsed button or expanded panel in widget mode
const WidgetLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isWidgetMode, isExpanded } = useWidgetMode();

  // Standalone mode - render normally
  if (!isWidgetMode) {
    return <>{children}</>;
  }

  // Widget mode - show button and container
  return (
    <>
      <WidgetButton />
      <WidgetContainer>
        {children}
      </WidgetContainer>
    </>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// 404 Not Found Component
const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-slate-400 text-4xl">search_off</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Page Not Found</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-primary text-white font-bold text-sm rounded-xl hover:bg-[#7A1628] transition-colors shadow-lg shadow-[#9B1B30]/20"
        >
          Go to Protocols
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <WidgetModeProvider>
        <AuthProvider>
          <ChatProvider>
            <HashRouter>
              <VoiceInputProvider>
                <ScrollToTop />
                <WidgetLayout>
                  <Routes>
                    {/* Login route - no MainLayout */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected routes with MainLayout */}
                    <Route path="/*" element={
                      <ProtectedRoute>
                        <MainLayout>
                          <Routes>
                            <Route path="/" element={<Browse />} />
                            <Route path="/protocol/:id" element={<ProtocolDetail />} />
                            <Route path="/chat" element={<Chat />} />
                            <Route path="/account" element={<Account />} />
                            <Route path="/hospitals" element={<Hospitals />} />
                            <Route path="/admin" element={
                              <AdminRoute>
                                <Admin />
                              </AdminRoute>
                            } />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </MainLayout>
                      </ProtectedRoute>
                    } />
                  </Routes>
                </WidgetLayout>
              </VoiceInputProvider>
            </HashRouter>
          </ChatProvider>
        </AuthProvider>
      </WidgetModeProvider>
    </ErrorBoundary>
  );
};

export default App;
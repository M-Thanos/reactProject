import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import './css/tailwind.css';  
import './css/style.css';
import './css/responsive.css';   

import Loader from './common/Loader';
// @ts-ignore
import ButtonDashboard from './pages/ButtonControl/ButtonDashboard' ;
// @ts-ignore
import ButtonArea from './pages/ButtonControl/ButtonPage/ButtonArea';
// @ts-ignore
import ClientButtonArea from './pages/ButtonControl/ClientPage/ClientButtonArea';
// @ts-ignore
import MarketersListPage from './pages/MarketersListPage';
// @ts-ignore
import ClientViewPage from './pages/ClientViewPage';
import Login from './pages/Auth/Login';
import UserManagement from './pages/Auth/UserManagement';
import InitialSetup from './pages/Setup/InitialSetup';
import ButtonShowcase from './pages/ButtonShowcase';
import AdvancedButtonShowcase from './pages/AdvancedButtonShowcase';
import ThemeCustomizer from './pages/ThemeCustomizer';

import DefaultLayout from './layout/DefaultLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();
  const { currentUser } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          currentUser ? <Navigate to="/" replace /> : <Login />
        } 
      />
      
      {/* Client View Route - Public - للعملاء فقط */}
      <Route path="/view/:linkId" element={<ClientViewPage />} />
      
      {/* Setup Route - للإعداد الأولي فقط */}
      {/* احذف هذا الـroute بعد إنشاء المستخدمين! */}
      <Route path="/setup" element={<InitialSetup />} />

      {/* Protected Routes */}
      <Route 
        path="/*" 
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <Routes>
                {/* Dashboard - All authenticated users */}
                <Route path="/" element={<ButtonDashboard />}>
                  <Route index element={<ButtonArea />} />
                </Route>

                {/* Client Area - All authenticated users */}
                <Route 
                  path="/client" 
                  element={<ClientButtonArea showControls={true} />} 
                />

                {/* Marketers List - Admin and Designer only */}
                <Route 
                  path="/marketers-list" 
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'designer']}>
                      <MarketersListPage />
                    </ProtectedRoute>
                  } 
                />

                {/* User Management - Admin only */}
                <Route 
                  path="/users" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <UserManagement />
                    </ProtectedRoute>
                  } 
                />

                {/* Button Showcase - All authenticated users */}
                <Route 
                  path="/buttons" 
                  element={<ButtonShowcase />} 
                />
                
                {/* Advanced Button Showcase */}
                <Route 
                  path="/advanced-buttons" 
                  element={<AdvancedButtonShowcase />} 
                />

                {/* Theme Customizer - Admin only */}
                <Route 
                  path="/theme" 
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'designer']}>
                      <ThemeCustomizer />
                    </ProtectedRoute>
                  } 
                />

                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </DefaultLayout>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;

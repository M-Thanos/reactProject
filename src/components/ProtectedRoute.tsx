import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';
import Loader from '../common/Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user has permission
  if (allowedRoles && allowedRoles.length > 0) {
    if (!userData || !allowedRoles.includes(userData.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-boxdark-2">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              غير مصرح لك بالوصول
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              ليس لديك صلاحيات الوصول إلى هذه الصفحة
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              دورك الحالي: {userData?.role || 'غير محدد'}
            </p>
            <button
              onClick={() => window.history.back()}
              className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all"
            >
              العودة
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;


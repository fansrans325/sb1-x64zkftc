import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CustomerManagement from './components/CustomerManagement';
import VehicleManagement from './components/VehicleManagement';
import KIRManagement from './components/KIRManagement';
import TaxManagement from './components/TaxManagement';
import MaintenanceModule from './components/MaintenanceModule';
import VendorManagement from './components/VendorManagement';
import PriceTracking from './components/PriceTracking';
import HPPCalculator from './components/HPPCalculator';
import ReportsAnalytics from './components/ReportsAnalytics';
import InvoiceManagement from './components/InvoiceManagement';
import UserManagement from './components/UserManagement';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Add detailed logging for debugging
  console.log('🔄 AppContent render:', { 
    isAuthenticated, 
    isLoading, 
    userExists: !!user,
    userEmail: user?.email,
    userRole: user?.role 
  });

  if (isLoading) {
    console.log('⏳ App is loading...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('❌ User not authenticated, showing login page');
    return <LoginPage />;
  }

  console.log('✅ User authenticated, showing dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ProtectedRoute requiredPermission="dashboard">
            <Dashboard onTabChange={setActiveTab} />
          </ProtectedRoute>
        );
      case 'customers':
        return (
          <ProtectedRoute requiredPermission="customers">
            <CustomerManagement />
          </ProtectedRoute>
        );
      case 'vehicles':
        return (
          <ProtectedRoute requiredPermission="vehicles">
            <VehicleManagement />
          </ProtectedRoute>
        );
      case 'kir':
        return (
          <ProtectedRoute requiredPermission="kir">
            <KIRManagement />
          </ProtectedRoute>
        );
      case 'tax':
        return (
          <ProtectedRoute requiredPermission="tax">
            <TaxManagement />
          </ProtectedRoute>
        );
      case 'maintenance':
        return (
          <ProtectedRoute requiredPermission="maintenance">
            <MaintenanceModule />
          </ProtectedRoute>
        );
      case 'vendors':
        return (
          <ProtectedRoute requiredPermission="vendors">
            <VendorManagement />
          </ProtectedRoute>
        );
      case 'pricing':
        return (
          <ProtectedRoute requiredPermission="pricing">
            <PriceTracking />
          </ProtectedRoute>
        );
      case 'hpp':
        return (
          <ProtectedRoute requiredPermission="hpp">
            <HPPCalculator />
          </ProtectedRoute>
        );
      case 'reports':
        return (
          <ProtectedRoute requiredPermission="reports">
            <ReportsAnalytics />
          </ProtectedRoute>
        );
      case 'invoices':
        return (
          <ProtectedRoute requiredPermission="invoices">
            <InvoiceManagement />
          </ProtectedRoute>
        );
      case 'users':
        return (
          <ProtectedRoute requiredPermission="users">
            <UserManagement />
          </ProtectedRoute>
        );
      default:
        return (
          <ProtectedRoute requiredPermission="dashboard">
            <Dashboard onTabChange={setActiveTab} />
          </ProtectedRoute>
        );
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

function App() {
  console.log('🚀 App component mounting...');
  
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
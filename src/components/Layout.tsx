import React, { useState } from 'react';
import { 
  Car, 
  Users, 
  Wrench, 
  FileText, 
  DollarSign, 
  BarChart, 
  UserCheck, 
  TrendingUp,
  Calculator,
  Menu,
  X,
  Home,
  Receipt,
  Shield,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, hasPermission } = useAuth();

  const navigation = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: Home,
      permission: 'dashboard'
    },
    { 
      id: 'customers', 
      name: 'Customers', 
      icon: Users,
      permission: 'customers'
    },
    { 
      id: 'vehicles', 
      name: 'Vehicles', 
      icon: Car,
      permission: 'vehicles'
    },
    { 
      id: 'invoices', 
      name: 'Invoices', 
      icon: Receipt,
      permission: 'invoices'
    },
    { 
      id: 'kir', 
      name: 'KIR Management', 
      icon: FileText,
      permission: 'kir'
    },
    { 
      id: 'tax', 
      name: 'Tax Management', 
      icon: DollarSign,
      permission: 'tax'
    },
    { 
      id: 'maintenance', 
      name: 'Maintenance', 
      icon: Wrench,
      permission: 'maintenance'
    },
    { 
      id: 'vendors', 
      name: 'Vendors', 
      icon: UserCheck,
      permission: 'vendors'
    },
    { 
      id: 'pricing', 
      name: 'Price Tracking', 
      icon: TrendingUp,
      permission: 'pricing'
    },
    { 
      id: 'hpp', 
      name: 'HPP Calculator', 
      icon: Calculator,
      permission: 'hpp'
    },
    { 
      id: 'reports', 
      name: 'Reports', 
      icon: BarChart,
      permission: 'reports'
    },
    { 
      id: 'users', 
      name: 'User Management', 
      icon: Shield,
      permission: 'users'
    }
  ];

  // Filter navigation based on user permissions
  const filteredNavigation = navigation.filter(item => {
    // Admin can see all items
    if (user?.role === 'admin') {
      return true;
    }
    
    // Manager can see most items except user management
    if (user?.role === 'manager') {
      return item.id !== 'users';
    }
    
    // For telemarketing roles, only show customers (NO VENDORS)
    if (user?.role?.startsWith('telemarketing')) {
      return item.id === 'customers';
    }
    
    return false;
  });

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin logout?')) {
      logout();
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Manager';
      case 'telemarketing-mobil': return 'Telemarketing Mobil';
      case 'telemarketing-bus': return 'Telemarketing Bus';
      case 'telemarketing-elf': return 'Telemarketing Elf';
      case 'telemarketing-hiace': return 'Telemarketing Hiace';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white p-2 rounded-lg shadow-md text-gray-600 hover:text-gray-900"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <Car className="text-blue-600 mr-3" size={32} />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Rentalinx</h1>
              <p className="text-sm text-gray-500">Car Rental POS</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <IconComponent size={20} className="mr-3" />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* User info */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
                <p className="text-xs text-blue-600 capitalize">{getRoleDisplayName(user?.role || '')}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:ml-64">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
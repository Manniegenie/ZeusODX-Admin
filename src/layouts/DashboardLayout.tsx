import { useState, useEffect, useMemo } from 'react';
import { DashboardTitleContext } from './DashboardTitleContext';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { usePermissions } from '@/core/hooks/usePermissions';
import {
  LayoutDashboard,
  Users,
  Calculator,
  Wallet,
  Shield,
  LineChart,
  Settings,
  ChevronDown,
  XIcon,
  MenuIcon,
  ChevronRightIcon,
  MoreVertical,
  UserCheck,
  Zap,
  CreditCard,
  UserCog,
  BarChart3,
  Image as ImageIcon,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout as logoutAction } from '@/features/auth/store/auth.slice';
import { authService } from '@/features/auth/services/auth.service';
import { Button } from '@/components/ui/button';
import type { RootState } from '@/core/store/store';
import Logo from '../assets/img/logo.png';
import { ProfileDropdown } from '@/components/ui/ProfileDropdown';
import { Popover } from '@/components/ui/Popover';
import type { FeatureAccess } from '@/core/types/auth.types';

interface SubMenuItem {
  title: string;
  path: string;
}

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  sub_menu?: SubMenuItem[];
  featureKey: keyof FeatureAccess; // Maps to permission key
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/',
    icon: <LayoutDashboard className="w-4 h-4" />,
    featureKey: 'dashboard',
  },
  {
    title: 'Platform Stats',
    path: '/platform-stats',
    icon: <BarChart3 className="w-4 h-4" />,
    featureKey: 'platformStats',
  },
  {
    title: 'User Management',
    path: '/users',
    icon: <Users className="w-4 h-4" />,
    featureKey: 'userManagement',
  },
  {
    title: 'KYC Review',
    path: '/kyc',
    icon: <UserCheck className="w-4 h-4" />,
    featureKey: 'kycReview',
  },
  {
    title: 'Fees & Rates',
    path: '/fees-rates',
    icon: <Calculator className="w-4 h-4" />,
    featureKey: 'feesAndRates',
    sub_menu: [
      { title: 'View all fees', path: '/fees-rates' },
      { title: 'Crypto fee management', path: '/fees-rates/crypto-fees-management' },
      { title: 'On-ramp management', path: '/fees-rates/onramp-management' },
      { title: 'Off-ramp management', path: '/fees-rates/offramp-management' },
      { title: 'Price markdown', path: '/fees-rates/price-markdown' },
      { title: 'Price calculator', path: '/fees-rates/price-calculator' },
    ]
  },
  {
    title: 'Gift Cards',
    path: '/giftcards',
    icon: <CreditCard className="w-4 h-4" />,
    featureKey: 'giftCards',
    sub_menu: [
      { title: 'Gift card rates', path: '/fees-rates/gift-card-rates' },
      { title: 'Review submissions', path: '/giftcards/submissions' },
    ]
  },
  {
    title: 'Push Notifications',
    path: '/notifications',
    icon: <Zap className="w-4 h-4" />,
    featureKey: 'pushNotifications',
    sub_menu: [
      { title: 'Send Notifications', path: '/notifications' },
      { title: 'Scheduled Notifications', path: '/scheduled-notifications' },
      { title: 'Gift Card Notifications', path: '/scheduled-giftcard-notifications' },
    ]
  },
  {
    title: 'Banners',
    path: '/banners',
    icon: <ImageIcon className="w-4 h-4" />,
    featureKey: 'banners',
  },
  {
    title: 'Funding & Balances',
    path: '/funding',
    icon: <Wallet className="w-4 h-4" />,
    featureKey: 'fundingAndBalances',
  },
  {
    title: 'Security',
    path: '/security',
    icon: <Shield className="w-4 h-4" />,
    featureKey: 'security',
  },
  {
    title: 'Audit & Monitoring',
    path: '/audit',
    icon: <LineChart className="w-4 h-4" />,
    featureKey: 'auditAndMonitoring',
  },
  {
    title: 'Admin Settings',
    path: '/admin-settings',
    icon: <UserCog className="w-4 h-4" />,
    featureKey: 'adminSettings',
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: <Settings className="w-4 h-4" />,
    featureKey: 'settings',
  },
];

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { hasFeatureAccess } = usePermissions();
  const [title, setTitle] = useState(() => {
    const currentNavItem = navItems.find(item => location.pathname.startsWith(item.path));
    return currentNavItem ? currentNavItem.title : 'Dashboard';
  });
  const [breadcrumb, setBreadcrumb] = useState<string[]>([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Helper to check if nav item or any of its sub_menu is active
  const isNavItemActive = (item: NavItem) => {
    if (location.pathname === item.path) return true;
    if (item.sub_menu) {
      return item.sub_menu.some(sub => location.pathname.startsWith(sub.path));
    }
    return false;
  };
  
  // Update title and reset state when location changes
  useEffect(() => {
    const currentNavItem = navItems.find(item => 
      location.pathname.startsWith(item.path)
    );
    if (currentNavItem) {
      setTitle(currentNavItem.title);
    }
    // Reset dropdown states on route change
    setIsSidebarDropdownOpen(false);
    setIsHeaderDropdownOpen(false);
  }, [location.pathname]);
  const handleLogout = async () => {
    await authService.logout();
    dispatch(logoutAction());
    navigate('/'); // Redirect to login or home page
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Separate open states for sidebar and header dropdowns
  const [isSidebarDropdownOpen, setIsSidebarDropdownOpen] = useState(false);
  const [isHeaderDropdownOpen, setIsHeaderDropdownOpen] = useState(false);

  // Sidebar nav filtering by permissions
  const filteredNavItems = navItems.filter(item => {
    // Super admins see all
    if (user?.role === 'super_admin') {
      return true;
    }
    // Check feature access based on permissions
    return hasFeatureAccess(item.featureKey);
  });

  const ctxValue = useMemo(() => ({ setTitle, setBreadcrumb }), [setTitle, setBreadcrumb]);

  return (
    <DashboardTitleContext.Provider value={ctxValue}>
      <div className="w-screen flex min-h-screen bg-white dark:bg-white text-gray-900 dark:text-gray-900">
        {/* Sidebar */}
        <aside
          className={`${isSidebarOpen ? 'w-56' : 'w-16'} min-h-screen sticky top-0 bg-primary shadow-lg transition-all duration-300 z-30 text-white flex flex-col justify-between`}
        >
          <div>
            <div className="flex items-center justify-between h-12 px-3">
              <h1 className={`${!isSidebarOpen && 'hidden'} font-bold text-lg`}>
                <img src={Logo} alt="Logo" className="h-6" />
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="text-white hover:bg-white/20"
              >
                {isSidebarOpen ? (
                  <ChevronDown className="w-5 h-5 rotate-90" />
                ) : (
                  <ChevronDown className="w-5 h-5 -rotate-90" />
                )}
              </Button>
            </div>

          <nav className="p-3 space-y-1">
            {filteredNavItems.map((item) => {
              const active = isNavItemActive(item);
              return item.sub_menu && item.sub_menu.length > 0 ? (
                <Popover
                  className="w-full"
                  key={item.path}
                  position="right"
                  trigger={
                    <div
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md transition-colors text-sm ${
                        active
                          ? 'bg-pupple-800 text-primary-foreground'
                          : 'hover:bg-pupple-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center">
                        {item.icon}
                        <span className={`${!isSidebarOpen && 'hidden'} ml-2.5`}>
                          {item.title}
                        </span>
                      </div>
                      <ChevronRightIcon className="w-3.5 h-3.5 ml-1.5" />
                    </div>
                  }
                  content={
                    <div className="p-1 rounded-none shadow-none">
                      {item.sub_menu.map((sub) => (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          className="block hover:bg-gray-100 px-2 py-2 border-b border-gray-100 cursor-pointer text-sm"
                        >
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  }
                />
              ) : (
                <div key={item.path}>
                  {item.title === 'Settings' && (
                    <hr className="my-1.5 border-t border-black/20" />
                  )}
                  <Link
                    to={item.path}
                    className={`flex items-center px-2.5 py-2 rounded-md transition-colors text-sm ${
                      location.pathname === item.path
                        ? 'bg-black/50 text-primary-foreground'
                        : 'hover:bg-black/40 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span className={`${!isSidebarOpen && 'hidden'} ml-2.5`}>
                      {item.title}
                    </span>
                  </Link>
                </div>
              )
          })}
          </nav>
            </div>
          <div className="relative space-y-1.5 p-3">
            <ProfileDropdown
              user={{
                name: user?.name && user?.name.trim() !== '' ? user.name : user?.adminName || '',
                email: user?.email || '',
              }}
              isOpen={isSidebarDropdownOpen}
              onToggle={() => setIsSidebarDropdownOpen((prev) => !prev)}
              onLogout={handleLogout}
              position="top"
              background="bg-transparent"
              nameColor="text-white"
              emailColor="text-gray-300"
              icon={MoreVertical}
            />
          </div>

        </aside>

        {/* Main Content */}
        <main
          className={`w-full flex-1 transition-all duration-300 flex flex-col min-h-screen`}
        >
          {/* Header */}
          <header className="h-auto bg-transparent w-full z-20 flex items-center justify-end px-4 py-2.5">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={toggleSidebar}
            >
              {isSidebarOpen ? (
                <XIcon className="w-4 h-4" />
              ) : (
                <MenuIcon className="w-4 h-4" />
              )}
            </Button>
            <div className='w-full flex justify-between items-end px-3'>
              <div className='w-fit flex flex-col items-start justify-start'>
                {/* Breadcrumbs (not shown on dashboard) */}
                {location.pathname !== '/dashboard' && breadcrumb.length > 0 && (
                  <nav className="flex text-xs text-[#475467] items-center space-x-1.5 mb-1">
                    {breadcrumb.map((crumb, idx) => (
                      <span key={idx} className="flex items-center">
                        {crumb}
                        {idx < breadcrumb.length - 1 && (
                          <ChevronRightIcon className="mx-1.5 w-3.5 h-3.5 text-gray-400" />
                        )}
                      </span>
                    ))}
                  </nav>
                )}
                <h1 className="text-lg font-medium text-[#2B2B2B]">{title}</h1>
              </div>
              <ProfileDropdown
                user={{
                  name: user?.name && user?.name.trim() !== '' ? user.name : user?.adminName || '',
                  email: user?.email || '',
                }}
                isOpen={isHeaderDropdownOpen}
                onToggle={() => setIsHeaderDropdownOpen((prev) => !prev)}
                onLogout={handleLogout}
                position="bottom"
                background="bg-gray-200"
                nameColor="text-black"
                emailColor="text-gray-500"
                icon={ChevronDown}
              />
            </div>
          </header>

          {/* Page Content */}
          <div className="w-full flex-1 p-3 mt-2 pb-6">
            <Outlet />
          </div>
        </main>
      </div>
    </DashboardTitleContext.Provider>
  );
}
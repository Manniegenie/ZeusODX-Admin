import { useState, useEffect, useMemo } from 'react';
import { DashboardTitleContext } from './DashboardTitleContext';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
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

interface SubMenuItem {
  title: string;
  path: string;
}

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  sub_menu?: SubMenuItem[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    title: 'User Management',
    path: '/users',
    icon: <Users className="w-5 h-5" />,
  },
  {
    title: 'KYC Review',
    path: '/kyc',
    icon: <UserCheck className="w-5 h-5" />,
  },
  {
    title: 'Fees & Rates',
    path: '/fees-rates',
    icon: <Calculator className="w-5 h-5" />,
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
    icon: <CreditCard className="w-5 h-5" />,
    sub_menu: [
      { title: 'Gift card rates', path: '/fees-rates/gift-card-rates' },
      { title: 'Review submissions', path: '/giftcards/submissions' },
    ]
  },
  {
    title: 'Push Notifications',
    path: '/notifications',
    icon: <Zap className="w-5 h-5" />,
    sub_menu: [
      { title: 'Send Notifications', path: '/notifications' },
      { title: 'Scheduled Notifications', path: '/scheduled-notifications' },
    ]
  },
  {
    title: 'Funding & Balances',
    path: '/funding',
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    title: 'Security',
    path: '/security',
    icon: <Shield className="w-5 h-5" />,
  },
  {
    title: 'Audit & Monitoring',
    path: '/audit',
    icon: <LineChart className="w-5 h-5" />,
  },
  {
    title: 'Admin Settings',
    path: '/admin-settings',
    icon: <UserCog className="w-5 h-5" />,
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: <Settings className="w-5 h-5" />,
  },
];

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
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

  const ctxValue = useMemo(() => ({ setTitle, setBreadcrumb }), [setTitle, setBreadcrumb]);

  return (
    <DashboardTitleContext.Provider value={ctxValue}>
      <div className="w-screen flex h-screen bg-white dark:bg-white text-gray-900 dark:text-gray-900">
        {/* Sidebar */}
        <aside
          className={`${isSidebarOpen ? 'w-64' : 'w-20'} h-screen bg-primary shadow-lg transition-all duration-300 z-30 text-white flex flex-col justify-between`}
        >
          <div>
            <div className="flex items-center justify-between h-16 px-4">
              <h1 className={`${!isSidebarOpen && 'hidden'} font-bold text-xl`}>
                <img src={Logo} alt="Logo" className="h-8" />
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

          <nav className="p-4 space-y-2">
            {navItems.map((item) =>{ 
              const active = isNavItemActive(item);
              return item.sub_menu && item.sub_menu.length > 0 ? (
                <Popover
                  className="w-full"
                  key={item.path}
                  position="right"
                  trigger={
                    <div
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        active 
                          ? 'bg-pupple-800 text-primary-foreground'
                          : 'hover:bg-pupple-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center">
                        {item.icon}
                        <span className={`${!isSidebarOpen && 'hidden'} ml-3`}>
                          {item.title}
                        </span>
                      </div>
                      <ChevronRightIcon className="w-4 h-4 ml-2" />
                    </div>
                  }
                  content={
                    <div className="p-1 rounded-none shadow-none">
                      {/* <div className="font-semibold text-lg mb-2">{item.title}</div> */}
                      {item.sub_menu.map((sub) => (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          className="block hover:bg-gray-100 px-2 py-2.5 border-b border-gray-100 cursor-pointer"
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
                    <hr className="my-2 border-t border-black/20" />
                  )}
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-black/50 text-primary-foreground'
                        : 'hover:bg-black/40 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span className={`${!isSidebarOpen && 'hidden'} ml-3`}>
                      {item.title}
                    </span>
                  </Link>
                </div>
              )
          })}
          </nav>
            </div>
          <div className="relative space-y-2 p-4">
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
          className={`w-full flex-1 transition-all duration-300 flex flex-col overflow-hidden`}
        >
          {/* Header */}
          <header className="h-auto bg-transparent w-full z-20 flex items-center justify-end px-6 py-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={toggleSidebar}
            >
              {isSidebarOpen ? (
                <XIcon className="w-5 h-5" />
              ) : (
                <MenuIcon className="w-5 h-5" />
              )}
            </Button>
            <div className='w-full flex justify-between items-end px-4'>
              <div className='w-fit flex flex-col items-start justify-start'>
                {/* Breadcrumbs (not shown on dashboard) */}
                {location.pathname !== '/dashboard' && breadcrumb.length > 0 && (
                  <nav className="flex text-[13px] text-[#475467] items-center space-x-2 mb-2">
                    {breadcrumb.map((crumb, idx) => (
                      <span key={idx} className="flex items-center">
                        {crumb}
                        {idx < breadcrumb.length - 1 && (
                          <ChevronRightIcon className="mx-2 w-4 h-4 text-gray-400" />
                        )}
                      </span>
                    ))}
                  </nav>
                )}
                <h1 className="text-[24px] font-medium text-[#2B2B2B]">{title}</h1>
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
          <div className="w-full flex-1 overflow-y-auto p-4 mt-4">
            <Outlet />
          </div>
        </main>
      </div>
    </DashboardTitleContext.Provider>
  );
}
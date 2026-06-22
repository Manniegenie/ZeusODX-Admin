import { ChevronDown, Moon, Sun, User } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/core/hooks/useTheme';

interface ProfileDropdownProps {
    user: { name?: string; adminName?: string; email?: string };
    isOpen: boolean;
    onToggle: () => void;
    onLogout: () => void;
    position?: 'top' | 'bottom';
    background?: string;
    nameColor?: string;
    emailColor?: string;
    icon?: React.ComponentType<any>;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  user, isOpen, onToggle, onLogout,
  position = 'bottom', background, nameColor, emailColor, icon
}) => {
  const displayName = user?.name || user?.adminName || '';
  const abbreviation = displayName.split(' ').filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="relative">
      <button
        className={`flex justify-between w-full items-center space-x-4 ${background} py-2 px-3 rounded-lg focus:outline-none`}
        type="button"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2">
          <div className="bg-primary/20 text-primary px-2 py-1.5 rounded-md font-semibold text-sm">
            {abbreviation || <User className="w-4 h-4" />}
          </div>
          <div className="text-left">
            <p className={`text-sm font-medium ${nameColor}`}>{displayName}</p>
            <p className={`text-xs ${emailColor}`}>{user?.email}</p>
          </div>
        </div>
        {icon ? React.createElement(icon, { className: "w-4 h-4 ml-2" }) : <ChevronDown className="w-4 h-4 ml-2" />}
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 ${position === 'top' ? 'bottom-full mb-2' : 'mt-2'} w-60 bg-card border border-border rounded-xl shadow-xl z-50`}
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                {abbreviation || <User className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{displayName || '—'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* My Profile link */}
          <button
            className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted/40 transition-colors flex items-center gap-2 border-b border-border"
            onClick={() => { onToggle(); navigate('/profile'); }}
          >
            <User className="w-4 h-4 text-muted-foreground" />
            My Profile
          </button>

          {/* Dark mode toggle */}
          <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-foreground">
              {isDark
                ? <Sun className="w-4 h-4 text-yellow-400" />
                : <Moon className="w-4 h-4 text-primary" />
              }
              <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); toggle(); }}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${isDark ? 'bg-primary' : 'bg-gray-300'}`}
              role="switch"
              aria-checked={isDark}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${isDark ? 'translate-x-4' : 'translate-x-0'}`}
              />
            </button>
          </div>

          {/* Logout */}
          <button
            className="w-full text-left text-red-500 font-medium px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors rounded-b-xl"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

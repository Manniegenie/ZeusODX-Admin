import { useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Moon, Sun, User, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/core/hooks/useTheme';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import type { RootState } from '@/core/store/store';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  moderator: 'Moderator',
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  moderator: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

export function ProfilePage() {
  const titleCtx = useContext(DashboardTitleContext);
  const { user } = useSelector((state: RootState) => state.auth);
  const { isDark, toggle } = useTheme();

  const displayName = user?.name || user?.adminName || '';
  const abbreviation = displayName.split(' ').filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const role = user?.role ?? 'admin';

  useEffect(() => {
    titleCtx?.setTitle('My Profile');
    titleCtx?.setBreadcrumb(['Profile']);
  }, [titleCtx]);

  return (
    <div className="max-w-2xl mx-auto space-y-5 mt-4 px-2">

      {/* Avatar + name card */}
      <Card className="border border-border shadow-none overflow-hidden">
        <div className="h-20 bg-primary/10 dark:bg-primary/20" />
        <CardContent className="pb-6 px-6 -mt-10">
          <div className="flex items-end gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold ring-4 ring-card shadow">
              {abbreviation || <User className="w-7 h-7" />}
            </div>
            <div className="pb-1">
              <p className="text-lg font-semibold text-foreground">{displayName || '—'}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground">Role</span>
              <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[role] ?? ROLE_COLORS.admin}`}>
                {ROLE_LABELS[role] ?? role}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="border border-border shadow-none">
        <CardContent className="px-6 py-5 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Appearance</p>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-yellow-400/15' : 'bg-primary/10'}`}>
                {isDark
                  ? <Sun className="w-4 h-4 text-yellow-400" />
                  : <Moon className="w-4 h-4 text-primary" />
                }
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Dark mode</p>
                <p className="text-xs text-muted-foreground">
                  {isDark ? 'Currently using dark theme' : 'Currently using light theme'}
                </p>
              </div>
            </div>
            <Switch checked={isDark} onCheckedChange={toggle} />
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

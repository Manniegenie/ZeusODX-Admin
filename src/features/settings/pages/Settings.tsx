import { useContext, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Bell, Palette, Globe, Database, Moon } from 'lucide-react';
import { useTheme } from '@/core/hooks/useTheme';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';

export function Settings() {
  const { isDark, toggle } = useTheme();
  const titleCtx = useContext(DashboardTitleContext);

  useEffect(() => {
    titleCtx?.setTitle('Settings');
    titleCtx?.setBreadcrumb(['Settings']);
  }, [titleCtx]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {/* Notifications Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
            <Bell className="w-5 h-5" />
            Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Email Notifications</h3>
                <p className="text-sm text-muted-foreground">Receive email updates</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Push Notifications</h3>
                <p className="text-sm text-muted-foreground">Receive push notifications</p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>

        {/* Display Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
            <Palette className="w-5 h-5" />
            Display
          </h2>
          <div className="space-y-4">
            {/* Dark Mode — wired to useTheme */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-primary/20' : 'bg-muted/40'}`}>
                  <Moon className={`w-4 h-4 ${isDark ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Dark Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    {isDark ? 'Currently using dark theme' : 'Currently using light theme'}
                  </p>
                </div>
              </div>
              <Switch checked={isDark} onCheckedChange={toggle} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Compact View</h3>
                <p className="text-sm text-muted-foreground">Enable compact layout</p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>

        {/* Regional Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
            <Globe className="w-5 h-5" />
            Regional
          </h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Language</label>
              <select
                aria-label="Language"
                className="w-full p-2 border border-border rounded-md bg-background text-foreground"
              >
                <option>English (US)</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Time Zone</label>
              <select
                aria-label="Time Zone"
                className="w-full p-2 border border-border rounded-md bg-background text-foreground"
              >
                <option>UTC (GMT+0)</option>
                <option>EST (GMT-5)</option>
                <option>PST (GMT-8)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* System Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
            <Database className="w-5 h-5" />
            System
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Automatic Updates</h3>
                <p className="text-sm text-muted-foreground">Keep system up to date</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Data Collection</h3>
                <p className="text-sm text-muted-foreground">Help improve our services</p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

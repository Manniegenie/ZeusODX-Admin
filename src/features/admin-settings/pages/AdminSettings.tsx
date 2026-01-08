import { useContext, useEffect } from 'react';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { CreateAdminForm } from '../components/CreateAdminForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, UserCog, Users } from 'lucide-react';

export function AdminSettings() {
  const titleCtx = useContext(DashboardTitleContext);

  useEffect(() => {
    titleCtx?.setTitle('Admin Settings');
    titleCtx?.setBreadcrumb(['Admin Settings']);
  }, [titleCtx]);

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-gray-900">Admin Management</h2>
        <p className="text-gray-600">
          Manage administrator accounts and permissions
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-gray-200 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Super Admin</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Full system access including the ability to create and manage other admins
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserCog className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Admin</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Can manage wallets, fees, notifications, and gift cards
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <CardTitle className="text-lg">Moderator</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Can view transactions, manage user accounts, and access reports
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Create Admin Form */}
      <div className="max-w-2xl">
        <CreateAdminForm />
      </div>
    </div>
  );
}

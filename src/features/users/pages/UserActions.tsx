import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  UserCircle,
  Shield,
  Key,
  Wallet,
  RefreshCw,
  Loader2,
  XCircle,
  Trash2,
  Ban
} from 'lucide-react';
import type { User } from '../types/user';

export function UserActions() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user as User | undefined;

  if (!user) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>No User Selected</CardTitle>
            <CardDescription>Please select a user from the users list.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/users')}>Go to Users</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const actionCategories = [
    {
      title: 'User Information',
      description: 'View comprehensive user details',
      actions: [
        {
          icon: UserCircle,
          label: 'View Summary',
          description: 'Complete user profile, wallets & balances',
          path: '/user-management/summary',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        }
      ]
    },
    {
      title: 'Security Management',
      description: 'Manage user security settings',
      actions: [
        {
          icon: Shield,
          label: 'Disable 2FA',
          description: 'Remove two-factor authentication',
          path: '/user-management/disable-2fa',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50'
        },
        {
          icon: Key,
          label: 'Remove Password',
          description: 'Reset user password/PIN',
          path: '/user-management/remove-password',
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        }
      ]
    },
    {
      title: 'Wallet Operations',
      description: 'Manage user wallets and addresses',
      actions: [
        {
          icon: Wallet,
          label: 'View Wallets',
          description: 'Check wallet addresses & balances',
          path: '/user-management/fetch-wallets',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50'
        },
        {
          icon: Loader2,
          label: 'Generate Wallets',
          description: 'Create new wallet addresses',
          path: '/user-management/generate-wallet-by-phone',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        },
        {
          icon: RefreshCw,
          label: 'Regenerate Wallets',
          description: 'Recreate existing wallet addresses',
          path: '/user-management/regenerate-wallet-by-phone',
          color: 'text-teal-600',
          bgColor: 'bg-teal-50'
        }
      ]
    },
    {
      title: 'Balance Management',
      description: 'Handle user balance operations',
      actions: [
        {
          icon: XCircle,
          label: 'Wipe Pending Balance',
          description: 'Clear pending balances for currencies',
          path: '/user-management/wipe-pending-balance',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        }
      ]
    },
    {
      title: 'Danger Zone',
      description: 'Destructive actions - use with caution',
      actions: [
        {
          icon: Ban,
          label: 'Block/Unblock User',
          description: 'Prevent user from withdrawals & utilities',
          path: '/user-management/block-user',
          color: 'text-orange-700',
          bgColor: 'bg-orange-100',
          isDanger: true
        },
        {
          icon: Trash2,
          label: 'Delete User',
          description: 'Permanently remove user account',
          path: '/users',
          color: 'text-red-700',
          bgColor: 'bg-red-100',
          isDanger: true
        }
      ]
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/users')}
          className="mb-4"
        >
          ← Back to Users
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">User Actions</CardTitle>
            <CardDescription className="text-base">
              Managing: <span className="font-semibold text-black">{user.email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Name:</span>{' '}
                <span className="font-medium">{user.firstname} {user.lastname}</span>
              </div>
              <div>
                <span className="text-gray-500">Phone:</span>{' '}
                <span className="font-medium">{user.phonenumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">KYC Level:</span>{' '}
                <span className="font-medium">{user.kycLevel}</span>
              </div>
              <div>
                <span className="text-gray-500">Email Verified:</span>{' '}
                <span className={user.emailVerified ? 'text-green-600' : 'text-red-600'}>
                  {user.emailVerified ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        {actionCategories.map((category) => (
          <div key={category.title}>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{category.title}</h2>
              <p className="text-sm text-gray-500">{category.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.actions.map((action) => (
                <Card
                  key={action.label}
                  className={`cursor-pointer hover:shadow-lg transition-shadow ${
                    'isDanger' in action && action.isDanger ? 'border-red-200' : ''
                  }`}
                  onClick={() => navigate(action.path, { state: { user } })}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${action.bgColor}`}>
                        <action.icon className={`h-6 w-6 ${action.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {action.label}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Backend Endpoints Reference */}
      <div className="mt-12">
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">Backend Endpoint Reference</CardTitle>
            <CardDescription>
              Available API endpoints for user management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm font-mono">
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="text-blue-600 font-semibold">GET</span>
                <span>/usermanagement/summary?email={'{email}'}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="text-orange-600 font-semibold">PATCH</span>
                <span>/2FA-Disable/disable-2fa</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="text-orange-600 font-semibold">PATCH</span>
                <span>/delete-pin/remove-passwordpin</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="text-green-600 font-semibold">POST</span>
                <span>/admin/wallets/fetch</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="text-green-600 font-semibold">POST</span>
                <span>/updateuseraddress/generate-wallets-by-phone</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="text-orange-600 font-semibold">PATCH</span>
                <span>/updateuseraddress/regenerate-by-phone</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="text-blue-600 font-semibold">GET</span>
                <span>/updateuseraddress/status-by-phone?phonenumber={'{phone}'}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="text-green-600 font-semibold">POST</span>
                <span>/pending/wipe</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="text-green-600 font-semibold">POST</span>
                <span>/blockuser/block</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="text-green-600 font-semibold">POST</span>
                <span>/blockuser/unblock</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="text-red-600 font-semibold">DELETE</span>
                <span>/deleteuser/user</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

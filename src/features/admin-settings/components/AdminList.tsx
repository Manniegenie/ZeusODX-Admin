import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Shield, UserCog, Users, ShieldCheck, ShieldAlert, RotateCcw } from 'lucide-react';
import { adminService } from '../services/admin.service';
import type { Admin } from '../types/admin.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AdminList() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [resetForm, setResetForm] = useState({
    email: '',
    passwordPin: '',
  });
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllAdmins();
      setAdmins(response.data);
    } catch (error: any) {
      toast.error('Failed to fetch admins', {
        description: error.response?.data?.message || 'An error occurred while fetching admins',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResetDialog = (admin: Admin) => {
    setSelectedAdmin(admin);
    setResetForm({ email: '', passwordPin: '' });
    setResetDialogOpen(true);
  };

  const handleCloseResetDialog = () => {
    setResetDialogOpen(false);
    setSelectedAdmin(null);
    setResetForm({ email: '', passwordPin: '' });
  };

  const handleReset2FA = async () => {
    if (!selectedAdmin) return;

    if (!resetForm.email || !resetForm.passwordPin) {
      toast.error('All fields are required');
      return;
    }

    if (resetForm.passwordPin.length !== 6) {
      toast.error('Password PIN must be 6 digits');
      return;
    }

    try {
      setResetting(true);
      await adminService.resetAdmin2FA({
        email: resetForm.email,
        passwordPin: resetForm.passwordPin,
        adminId: selectedAdmin._id,
      });

      toast.success('2FA reset successfully', {
        description: `2FA has been disabled for ${selectedAdmin.adminName}`,
      });

      handleCloseResetDialog();
      fetchAdmins(); // Refresh the list
    } catch (error: any) {
      toast.error('Failed to reset 2FA', {
        description: error.response?.data?.message || 'An error occurred while resetting 2FA',
      });
    } finally {
      setResetting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Shield className="w-4 h-4 text-purple-600" />;
      case 'admin':
        return <UserCog className="w-4 h-4 text-blue-600" />;
      case 'moderator':
        return <Users className="w-4 h-4 text-green-600" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-700 hover:bg-purple-100';
      case 'admin':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
      case 'moderator':
        return 'bg-green-100 text-green-700 hover:bg-green-100';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registered Administrators</CardTitle>
          <CardDescription>Loading administrators...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Registered Administrators</CardTitle>
          <CardDescription>
            Manage administrator accounts and their 2FA settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No administrators found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>2FA Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin._id}>
                      <TableCell className="font-medium">{admin.adminName}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(admin.role)}>
                          <span className="flex items-center gap-1">
                            {getRoleIcon(admin.role)}
                            {admin.role.replace('_', ' ')}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {admin.isActive ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {admin.is2FASetupCompleted ? (
                            <>
                              <ShieldCheck className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-700">Setup Complete</span>
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-4 h-4 text-orange-600" />
                              <span className="text-sm text-orange-700">Not Setup</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(admin.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {admin.is2FASetupCompleted && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenResetDialog(admin)}
                            className="gap-2"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Reset 2FA
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reset 2FA Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset 2FA for {selectedAdmin?.adminName}</DialogTitle>
            <DialogDescription>
              This action requires super admin authentication. Enter your email and password PIN to
              confirm.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Your Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="Enter your email"
                value={resetForm.email}
                onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-pin">Your Password PIN</Label>
              <Input
                id="reset-pin"
                type="password"
                placeholder="Enter your 6-digit PIN"
                maxLength={6}
                value={resetForm.passwordPin}
                onChange={(e) =>
                  setResetForm({ ...resetForm, passwordPin: e.target.value.replace(/\D/g, '') })
                }
              />
            </div>

            <div className="rounded-lg bg-orange-50 border border-orange-200 p-3">
              <p className="text-sm text-orange-800">
                <strong>Warning:</strong> This will disable 2FA for {selectedAdmin?.adminName} and
                allow them to set it up again.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseResetDialog} disabled={resetting}>
              Cancel
            </Button>
            <Button onClick={handleReset2FA} disabled={resetting} className="gap-2">
              {resetting ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Reset 2FA
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

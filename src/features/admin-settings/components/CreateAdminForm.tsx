import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { adminService } from '../services/admin.service';
import type { AdminRole } from '../types/admin.types';

export function CreateAdminForm() {
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [passwordPin, setPasswordPin] = useState('');
  const [role, setRole] = useState<AdminRole>('admin');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!adminName || adminName.length < 2 || adminName.length > 100) {
      toast.error('Admin name must be between 2 and 100 characters');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast.error('Enter a valid email address');
      return false;
    }
    if (!/^[0-9]{6}$/.test(passwordPin)) {
      toast.error('Password PIN must be exactly 6 digits');
      return false;
    }
    if (!['admin', 'super_admin', 'moderator'].includes(role)) {
      toast.error('Invalid role');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = { adminName, email, passwordPin, role };
      const res = await adminService.createAdmin(payload);
      toast.success(res?.message || 'Admin created successfully');
      // Clear form
      setAdminName('');
      setEmail('');
      setPasswordPin('');
      setRole('admin');
    } catch (err: unknown) {
      const anyErr = err as { response?: { status?: number; data?: { message?: string } } };
      if (anyErr?.response?.status === 409) {
        toast.error('An admin with this email already exists');
      } else if (anyErr?.response?.data?.message) {
        toast.error(anyErr.response.data.message);
      } else {
        toast.error('Failed to create admin');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-gray-200 shadow-none">
      <CardHeader>
        <CardTitle>Create New Admin</CardTitle>
        <CardDescription>
          Add a new administrator to the system. Only super admins can create new admin accounts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="flex flex-col gap-2 items-start justify-center w-full">
            <Label className="w-full text-gray-800" htmlFor="adminName">
              Admin Name
            </Label>
            <Input
              id="adminName"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              type="text"
              name="adminName"
              placeholder="Enter admin name"
              className="w-full h-12 border border-gray-200 shadow-none"
              required
            />
          </div>

          <div className="flex flex-col gap-2 items-start justify-center w-full">
            <Label className="w-full text-gray-800" htmlFor="email">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              name="email"
              placeholder="admin@example.com"
              className="w-full h-12 border border-gray-200 shadow-none"
              required
            />
          </div>

          <div className="flex flex-col gap-2 items-start justify-center w-full">
            <Label className="w-full text-gray-800" htmlFor="passwordPin">
              Password PIN
            </Label>
            <Input
              id="passwordPin"
              type="password"
              value={passwordPin}
              onChange={(e) => setPasswordPin(e.target.value)}
              name="passwordPin"
              placeholder="6-digit PIN"
              maxLength={6}
              className="w-full h-12 border border-gray-200 shadow-none"
              required
            />
            <p className="text-sm text-gray-500">Must be exactly 6 digits</p>
          </div>

          <div className="flex flex-col gap-2 items-start justify-center w-full">
            <Label className="w-full text-gray-800" htmlFor="role">
              Role
            </Label>
            <select
              id="role"
              aria-label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              className="w-full h-12 border border-gray-200 rounded px-3 py-2 shadow-none"
            >
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <p className="text-sm text-gray-500">
              {role === 'super_admin' && 'Full system access including admin management'}
              {role === 'admin' && 'Can manage wallets, fees, and notifications'}
              {role === 'moderator' && 'Can view transactions and manage user accounts'}
            </p>
          </div>

          <div>
            <Button
              type="submit"
              className="flex h-12 w-full text-white items-center gap-2"
              disabled={loading}
            >
              {loading ? 'Creating Admin...' : 'Create Admin'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

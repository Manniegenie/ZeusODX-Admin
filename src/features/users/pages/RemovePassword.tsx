import { useContext, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocation, useNavigate } from 'react-router-dom';
import { removePasswordPin } from '@/features/users/services/usersService';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { SuccessModal } from '@/components/ui/SuccessModal';

export function RemovePassword() {
  const titleCtx = useContext(DashboardTitleContext);

  const location = useLocation();
  const navigate = useNavigate();
  const stateUser = (location.state as any)?.user;
  const [emailValue, setEmailValue] = useState(stateUser?.email || '');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    titleCtx?.setTitle('Remove Password');
    titleCtx?.setBreadcrumb([
      'User Management',
      'User Account',
      'Remove password',
    ]);
  }, [titleCtx]);

  const handleRemove = async () => {
    const email = emailValue.trim();
    if (!email) {
      toast.error('Please provide an email');
      return;
    }
    setLoading(true);
    try {
      const resp = await removePasswordPin(email);
      if (resp && resp.message) {
        setConfirmOpen(false);
        setSuccessOpen(true);
      } else {
        toast.error('Failed to remove password PIN');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to remove password PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 space-y-6">
      <Card className='border border-gray-200 shadow-none'>
        <CardContent className="py-12 px-6">
          <div className="w-full flex flex-col justify-center items-start gap-8">
            <div className="flex flex-col gap-2 items-start justify-center w-full">
              <Label className="w-full text-gray-800" htmlFor="email">User Email</Label>
              <Input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full h-12 border border-gray-200 shadow-none"
                required
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={loading || !emailValue.trim()}
              className="flex h-12 w-full text-white items-center gap-2"
            >
              Remove Password
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={(v) => { if (!loading) setConfirmOpen(v); }}>
        <DialogContent className='bg-white w-full max-w-md text-black/90 border border-gray-200 shadow-lg'>
          <DialogHeader>
            <DialogTitle>Confirm Remove Password PIN</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to remove the password PIN for <strong>{emailValue}</strong>? This action cannot be undone.
          </div>
          <DialogFooter>
            <Button
              className='bg-white border border-red-500 text-red-500'
              onClick={() => setConfirmOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleRemove} className='bg-red-500 text-white' disabled={loading}>
              {loading ? 'Removing...' : 'Remove PIN'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SuccessModal
        isOpen={successOpen}
        onClose={() => { setSuccessOpen(false); navigate(-1); }}
        title="Password PIN Removed"
        message="The user's password PIN has been successfully removed."
        details={[{ label: 'User', value: emailValue }]}
        redirectTo={undefined}
        showRedirectButton={false}
      />
    </div>
  );
}

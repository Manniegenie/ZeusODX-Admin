import { useContext, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { disableTwoFa } from '@/features/users/services/twoFaService';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { SuccessModal } from '@/components/ui/SuccessModal';

export function Disable2Fa() {
  const titleCtx = useContext(DashboardTitleContext);

  const location = useLocation();
  const navigate = useNavigate();
  const stateUser = (location.state as any)?.user;
  const [emailValue, setEmailValue] = useState(stateUser?.email || '');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    titleCtx?.setTitle('Disable 2fa');
    titleCtx?.setBreadcrumb([
      'User Management',
      'User Account',
      'Disable 2fa',
    ]);
  }, [titleCtx]);

  const handleDisable = async () => {
    const email = emailValue.trim();
    if (!email) {
      toast.error('Please provide an email');
      return;
    }
    setLoading(true);
    try {
      const resp = await disableTwoFa(email);
      if (resp && resp.success) {
        setConfirmOpen(false);
        setSuccessOpen(true);
      } else {
        toast.error(resp?.message || 'Failed to disable 2FA');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Disable 2FA failed');
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
              <Lock className="h-4 w-4" />
              Disable 2fa
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={(v) => { if (!loading) setConfirmOpen(v); }}>
        <DialogContent className='bg-white text-black/90 border border-gray-200 shadow-lg max-w-md'>
          <DialogHeader>
            <DialogTitle>Confirm Disable 2FA</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to disable two-factor authentication for <strong>{emailValue}</strong>? This action can reduce account security.
          </div>
          <DialogFooter>
            <Button
              className='border border-red-500 text-red-500'
              onClick={() => setConfirmOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleDisable} className='bg-red-500 text-white' disabled={loading}>
              {loading ? 'Disabling...' : 'Disable 2FA'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SuccessModal
        isOpen={successOpen}
        onClose={() => { setSuccessOpen(false); navigate(-1); }}
        title="2FA Disabled"
        message="Two-factor authentication has been disabled for this user."
        details={[{ label: 'User', value: emailValue }]}
        redirectTo={undefined}
        showRedirectButton={false}
      />
    </div>
  );
}

import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { KeyRound } from 'lucide-react';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { toast } from 'sonner';
import { resetUserPin } from '@/features/users/services/usersService';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { TwoFAModal } from '@/components/TwoFAModal';

export function ResetUserPin() {
  const titleCtx = useContext(DashboardTitleContext);
  const location = useLocation();
  const navigate = useNavigate();
  const stateUser = (location.state as any)?.user;

  const [emailValue, setEmailValue] = useState(stateUser?.email || '');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [twoFAOpen, setTwoFAOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    titleCtx?.setTitle('Reset User PIN');
    titleCtx?.setBreadcrumb(['User Management', 'User Account', 'Reset PIN']);
  }, [titleCtx]);

  const openTwoFA = () => {
    setConfirmOpen(false);
    setTwoFAOpen(true);
  };

  const handleReset = async (twoFAToken: string) => {
    const email = emailValue.trim();
    if (!email) {
      toast.error('Please provide an email');
      return;
    }
    setLoading(true);
    try {
      const resp = await resetUserPin(email, twoFAToken);
      if (resp?.success) {
        setTwoFAOpen(false);
        setSuccessOpen(true);
      } else {
        toast.error(resp?.message || 'Failed to reset PIN');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to reset PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 space-y-6">
      <Card className="border border-gray-200 shadow-none">
        <CardContent className="py-12 px-6">
          <div className="w-full flex flex-col justify-center items-start gap-8">
            <div className="flex flex-col gap-2 items-start w-full">
              <Label className="text-gray-800" htmlFor="email">User Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                className="w-full h-12 border border-gray-200 shadow-none"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={!emailValue.trim() || loading}
              className="flex h-12 w-full text-white items-center gap-2"
            >
              <KeyRound className="h-4 w-4" />
              Reset PIN
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={(v) => { if (!loading) setConfirmOpen(v); }}>
        <DialogContent className="bg-white text-black/90 border border-gray-200 shadow-lg max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm PIN Reset</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2 text-sm text-gray-700">
            <p>This will clear the PIN for:</p>
            <p className="font-semibold text-black">{emailValue}</p>
            <p className="text-gray-500">
              The user will be signed out on all devices and Face ID login will be turned off. They set a new PIN with Forgot PIN on the sign-in screen. Only do this after verifying the request with the account holder.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border border-gray-300"
              onClick={() => setConfirmOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={openTwoFA}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TwoFAModal
        open={twoFAOpen}
        title="Confirm PIN reset"
        description={`Enter your 2FA code to reset the PIN for ${emailValue.trim()}.`}
        loading={loading}
        onClose={() => setTwoFAOpen(false)}
        onConfirm={handleReset}
      />

      <SuccessModal
        isOpen={successOpen}
        onClose={() => { setSuccessOpen(false); navigate(-1); }}
        title="PIN Reset Successful"
        message="The user's PIN has been cleared and they've been signed out. They set a new PIN with Forgot PIN on the sign-in screen."
        details={[{ label: 'User', value: emailValue }]}
        redirectTo={undefined}
        showRedirectButton={false}
      />
    </div>
  );
}

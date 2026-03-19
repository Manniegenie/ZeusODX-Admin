import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { LockOpen } from 'lucide-react';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { toast } from 'sonner';
import { unlockUserPin } from '@/features/users/services/userService';

export function UnlockPin() {
  const titleCtx = useContext(DashboardTitleContext);
  const location = useLocation();
  const navigate = useNavigate();
  const stateUser = (location.state as any)?.user;

  const [emailValue, setEmailValue] = useState(stateUser?.email || '');
  const [userId, setUserId] = useState(stateUser?._id || stateUser?.id || '');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    titleCtx?.setTitle('Unlock PIN Account');
    titleCtx?.setBreadcrumb(['User Management', 'User Account', 'Unlock PIN']);
  }, [titleCtx]);

  const handleUnlock = async () => {
    if (!userId.trim()) {
      toast.error('User ID is required');
      return;
    }
    setLoading(true);
    try {
      const resp = await unlockUserPin(userId.trim());
      if (resp?.success) {
        toast.success(resp.message || 'PIN lock cleared successfully');
        setConfirmOpen(false);
        navigate(-1);
      } else {
        toast.error(resp?.message || 'Failed to unlock account');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to unlock account');
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
              />
            </div>

            <div className="flex flex-col gap-2 items-start w-full">
              <Label className="text-gray-800" htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                type="text"
                placeholder="User ID"
                className="w-full h-12 border border-gray-200 shadow-none"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                The user ID is required to call the unlock endpoint. It is pre-filled when navigating from the user actions page.
              </p>
            </div>

            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={!userId.trim()}
              className="flex h-12 w-full text-white items-center gap-2"
            >
              <LockOpen className="h-4 w-4" />
              Unlock PIN Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-white text-black/90 border border-gray-200 shadow-lg max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm PIN Unlock</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2 text-sm text-gray-700">
            <p>
              This will clear the PIN lock and reset the failed-attempt counter for:
            </p>
            <p className="font-semibold text-black">{emailValue || userId}</p>
            <p className="text-gray-500">
              The user will be able to attempt withdrawals again immediately. Only do this after verifying the account holder contacted support.
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
              onClick={handleUnlock}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? 'Unlocking…' : 'Confirm Unlock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

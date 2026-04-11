import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ShieldOff } from 'lucide-react';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { toast } from 'sonner';
import { unlock2FALock } from '@/features/users/services/userService';

export function Unlock2FA() {
  const titleCtx = useContext(DashboardTitleContext);
  const location = useLocation();
  const navigate = useNavigate();
  const stateUser = (location.state as any)?.user;

  const [emailValue, setEmailValue] = useState(stateUser?.email || '');
  const [userId, setUserId] = useState(stateUser?._id || stateUser?.id || '');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    titleCtx?.setTitle('Unlock 2FA Lock');
    titleCtx?.setBreadcrumb(['User Management', 'User Account', 'Unlock 2FA Lock']);
  }, [titleCtx]);

  const handleUnlock = async () => {
    if (!userId.trim()) {
      toast.error('User ID is required');
      return;
    }
    setLoading(true);
    try {
      const resp = await unlock2FALock(userId.trim());
      if (resp?.success) {
        toast.success(resp.message || '2FA lock cleared successfully');
        setConfirmOpen(false);
        navigate(-1);
      } else {
        toast.error(resp?.message || 'Failed to unlock 2FA lock');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to unlock 2FA lock');
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
                Pre-filled when navigating from the user actions page. Clears the 2FA rate-limit lock set after 5 failed attempts.
              </p>
            </div>

            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={!userId.trim()}
              className="flex h-12 w-full text-white items-center gap-2"
            >
              <ShieldOff className="h-4 w-4" />
              Unlock 2FA Lock
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-white text-black/90 border border-gray-200 shadow-lg max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm 2FA Unlock</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2 text-sm text-gray-700">
            <p>This will clear the 2FA rate-limit lock for:</p>
            <p className="font-semibold text-black">{emailValue || userId}</p>
            <p className="text-gray-500">
              The user will be able to attempt 2FA-protected actions (withdrawals, etc.) again immediately. Only do this after verifying the account holder contacted support.
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Unlocking…' : 'Confirm Unlock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

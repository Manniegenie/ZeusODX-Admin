import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardTitleContext } from "@/layouts/DashboardTitleContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { changeUserEmail } from "@/features/users/services/usersService";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Mail } from "lucide-react";
import { TwoFAModal } from "@/components/TwoFAModal";
import { SuccessModal } from "@/components/ui/SuccessModal";

export function ChangeUserEmail() {
  const titleCtx = useContext(DashboardTitleContext);
  const location = useLocation();
  const navigate = useNavigate();
  const navState = (location.state ?? {}) as { user?: { _id?: string; email?: string } };

  const userId = navState.user?._id ?? "";
  const currentEmail = navState.user?.email ?? "";

  const [newEmail, setNewEmail] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [twoFAOpen, setTwoFAOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    titleCtx?.setTitle("Change User Email");
    titleCtx?.setBreadcrumb(["User Management", "Change User Email"]);
  }, [titleCtx]);

  if (!userId) {
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

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidNewEmail = emailPattern.test(newEmail.trim());

  const handleChangeClick = () => {
    if (!isValidNewEmail) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (newEmail.trim().toLowerCase() === currentEmail.toLowerCase()) {
      toast.error('This is already the user\'s email address');
      return;
    }
    if (!reason.trim()) {
      toast.error('A reason is required to change a user\'s email');
      return;
    }
    setConfirmOpen(true);
  };

  const openTwoFA = () => {
    setConfirmOpen(false);
    setTwoFAOpen(true);
  };

  const handleConfirmed = async (twoFAToken: string) => {
    try {
      setActionLoading(true);
      setTwoFAOpen(false);

      const res = await changeUserEmail(userId, newEmail.trim(), reason.trim(), twoFAToken);
      setSuccessMessage(res.message || 'Email address changed.');
      setSuccessOpen(true);
      setNewEmail('');
      setReason('');
    } catch (err: any) {
      console.error('Change user email failed', err);
      const errorMessage = err?.response?.data?.message || err?.response?.data?.error || 'Action failed';
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-10 mt-4">
      <div className="mb-4">
        <Button variant="outline" onClick={() => navigate('/users')} className="mb-4">
          ← Back to Users
        </Button>
      </div>

      <Card className="border border-gray-200 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Change User Email
          </CardTitle>
          <CardDescription>
            Update the email address on file for {currentEmail || 'this user'}. The new address
            starts unverified — the user must verify it through the app before it counts toward KYC.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6 px-4">
          <div className="w-full py-2 flex flex-col justify-center items-start gap-5">

            <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-1 text-sm">Current Email</h4>
              <p className="text-sm text-gray-600">{currentEmail || 'Unknown'}</p>
            </div>

            <div className="w-full space-y-2">
              <Label className="text-sm font-medium text-gray-500" htmlFor="newEmail">
                New Email Address
              </Label>
              <Input
                type="email"
                name="newEmail"
                className="w-full py-6 border-gray-300"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>

            <div className="w-full space-y-2">
              <Label className="text-sm font-medium text-gray-500" htmlFor="reason">
                Reason (required, kept in the audit trail)
              </Label>
              <Input
                type="text"
                name="reason"
                className="w-full py-6 border-gray-300"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. User lost access to old address, verified identity via support ticket #..."
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 w-full">
              <h4 className="font-semibold text-yellow-800 mb-2">Warning</h4>
              <p className="text-sm text-yellow-700">
                This changes the account's login/notification email and resets email verification.
                Only do this after independently verifying the request came from the account owner.
              </p>
            </div>

            <Button
              className="w-full text-white h-10 bg-orange-600 hover:bg-orange-700"
              onClick={handleChangeClick}
              disabled={actionLoading || !isValidNewEmail || !reason.trim()}
            >
              {actionLoading ? 'Changing…' : 'Change Email'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className='bg-white w-full max-w-md text-black/90 border border-gray-200 shadow-lg'>
          <DialogHeader>
            <DialogTitle>Confirm Email Change</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">You are about to change this user's email address:</p>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p><strong>Current:</strong> {currentEmail}</p>
              <p><strong>New:</strong> {newEmail.trim()}</p>
              <p><strong>Reason:</strong> {reason}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className='border border-gray-300' onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={openTwoFA}
              className='bg-orange-600 hover:bg-orange-700 text-white'
              disabled={actionLoading}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TwoFAModal
        open={twoFAOpen}
        title="Confirm email change"
        description={`You are about to change this user's email from ${currentEmail} to ${newEmail.trim()}.`}
        loading={actionLoading}
        onClose={() => setTwoFAOpen(false)}
        onConfirm={handleConfirmed}
      />

      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Email Changed"
        message={successMessage}
        details={[]}
        redirectTo={undefined}
        showRedirectButton={false}
      />
    </div>
  );
}

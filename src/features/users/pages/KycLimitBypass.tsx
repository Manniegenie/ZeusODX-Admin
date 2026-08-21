import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardTitleContext } from "@/layouts/DashboardTitleContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { grantKycLimitBypass, revokeKycLimitBypass, getKycLimitBypassStatus } from "@/features/users/services/usersService";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ShieldAlert } from "lucide-react";
import { TwoFAModal } from "@/components/TwoFAModal";
import { SuccessModal } from "@/components/ui/SuccessModal";

interface BypassStatus {
  active: boolean;
  enabled?: boolean;
  expiresAt?: string | null;
  reason?: string | null;
  grantedBy?: { adminName?: string; email?: string } | null;
  grantedAt?: string | null;
}

export function KycLimitBypass() {
  const titleCtx = useContext(DashboardTitleContext);
  const location = useLocation();
  const navigate = useNavigate();
  const navState = (location.state ?? {}) as { user?: { _id?: string; email?: string; kycLevel?: number } };

  const userId = navState.user?._id ?? "";
  const userEmail = navState.user?.email ?? "";

  const [durationHours, setDurationHours] = useState<string>("12");
  const [reason, setReason] = useState<string>("");
  const [status, setStatus] = useState<BypassStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [twoFAOpen, setTwoFAOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'grant' | 'revoke' | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    titleCtx?.setTitle("KYC Limit Bypass");
    titleCtx?.setBreadcrumb(["User Management", "KYC Limit Bypass"]);
  }, [titleCtx]);

  const loadStatus = async () => {
    if (!userId) return;
    try {
      setStatusLoading(true);
      const res = await getKycLimitBypassStatus(userId);
      if (res.success) setStatus(res.data);
    } catch (err: any) {
      console.error('Failed to load bypass status', err);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

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

  const handleGrantClick = () => {
    const hours = parseFloat(durationHours);
    if (!hours || hours <= 0) {
      toast.error('Please enter a valid duration in hours');
      return;
    }
    if (!reason.trim()) {
      toast.error('A reason is required to grant a bypass');
      return;
    }
    setPendingAction('grant');
    setConfirmOpen(true);
  };

  const handleQuickReset = () => {
    setDurationHours('24');
    setReason('Daily KYC limit reset by admin');
    setPendingAction('grant');
    setConfirmOpen(true);
  };

  const handleRevokeClick = () => {
    setPendingAction('revoke');
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

      if (pendingAction === 'grant') {
        const res = await grantKycLimitBypass(userId, parseFloat(durationHours), reason.trim(), twoFAToken);
        setSuccessMessage(res.message || 'KYC limit bypass granted.');
        setReason('');
      } else if (pendingAction === 'revoke') {
        const res = await revokeKycLimitBypass(userId, twoFAToken);
        setSuccessMessage(res.message || 'KYC limit bypass revoked.');
      }

      setSuccessOpen(true);
      await loadStatus();
    } catch (err: any) {
      console.error('KYC limit bypass action failed', err);
      const errorMessage = err?.response?.data?.message || err?.response?.data?.error || 'Action failed';
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
      setPendingAction(null);
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
            <ShieldAlert className="h-5 w-5" />
            KYC Spending Limit Bypass
          </CardTitle>
          <CardDescription>
            Grant {userEmail} a temporary exception to their daily/monthly naira spending caps
            (external transfer, NGNZ withdrawal, internal transfer). This does not skip KYC level
            requirements — a Level 0/1 user still cannot access crypto features.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6 px-4">
          <div className="w-full py-2 flex flex-col justify-center items-start gap-5">

            {/* Current status */}
            <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2 text-sm">Current Status</h4>
              {statusLoading ? (
                <p className="text-sm text-gray-500">Loading…</p>
              ) : status?.active ? (
                <div className="text-sm space-y-1">
                  <p><span className="text-green-700 font-medium">Active</span> — expires {status.expiresAt ? new Date(status.expiresAt).toLocaleString() : 'unknown'}</p>
                  {status.reason && <p className="text-gray-600">Reason: {status.reason}</p>}
                  {status.grantedBy?.email && <p className="text-gray-600">Granted by: {status.grantedBy.adminName || status.grantedBy.email}</p>}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No active bypass.</p>
              )}
            </div>

            {status?.active && (
              <Button
                variant="outline"
                className="w-full h-10 border border-red-300 text-red-600 hover:bg-red-50"
                onClick={handleRevokeClick}
                disabled={actionLoading}
              >
                Revoke Active Bypass
              </Button>
            )}

            <Button
              className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleQuickReset}
              disabled={actionLoading}
            >
              Quick Reset (24h, no form needed)
            </Button>
            <p className="text-xs text-gray-500 -mt-3">
              Same mechanism as below, pre-filled with a 24-hour duration and a generic reason — use this for the common "let them transact again today" case.
            </p>

            <div className="w-full border-t pt-5 space-y-5">
              <div className="w-full space-y-2">
                <Label className="text-sm font-medium text-gray-500" htmlFor="durationHours">
                  Duration (hours)
                </Label>
                <Input
                  type="number"
                  name="durationHours"
                  className="w-full py-6 border-gray-300"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  placeholder="12"
                  min="1"
                  max="720"
                  step="1"
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
                  placeholder="e.g. Verified large legitimate withdrawal, ref #..."
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 w-full">
                <h4 className="font-semibold text-yellow-800 mb-2">Warning</h4>
                <p className="text-sm text-yellow-700">
                  This lifts the daily/monthly naira spending ceiling for this user until it expires.
                  Only grant this after independently verifying the transaction is legitimate.
                </p>
              </div>

              <Button
                className="w-full text-white h-10 bg-orange-600 hover:bg-orange-700"
                onClick={handleGrantClick}
                disabled={actionLoading || !reason.trim() || !durationHours}
              >
                {actionLoading ? 'Granting…' : 'Grant Bypass'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className='bg-white w-full max-w-md text-black/90 border border-gray-200 shadow-lg'>
          <DialogHeader>
            <DialogTitle>{pendingAction === 'grant' ? 'Confirm Bypass Grant' : 'Confirm Bypass Revocation'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {pendingAction === 'grant' ? (
              <>
                <p className="mb-4">You are about to grant a spending limit bypass:</p>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>User:</strong> {userEmail}</p>
                  <p><strong>Duration:</strong> {durationHours} hour(s)</p>
                  <p><strong>Reason:</strong> {reason}</p>
                </div>
              </>
            ) : (
              <p>Revoke the active bypass for <strong>{userEmail}</strong> now?</p>
            )}
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
        title={pendingAction === 'grant' ? 'Confirm bypass grant' : 'Confirm bypass revocation'}
        description={pendingAction === 'grant'
          ? `You are about to grant ${userEmail} a ${durationHours}h spending limit bypass.`
          : `You are about to revoke the active bypass for ${userEmail}.`}
        loading={actionLoading}
        onClose={() => setTwoFAOpen(false)}
        onConfirm={handleConfirmed}
      />

      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title={pendingAction === 'grant' ? 'Bypass Granted' : 'Bypass Revoked'}
        message={successMessage}
        details={[]}
        redirectTo={undefined}
        showRedirectButton={false}
      />
    </div>
  );
}

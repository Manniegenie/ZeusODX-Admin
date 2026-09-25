import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardTitleContext } from "@/layouts/DashboardTitleContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { changeUserName } from "@/features/users/services/usersService";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { UserCog } from "lucide-react";
import { TwoFAModal } from "@/components/TwoFAModal";
import { SuccessModal } from "@/components/ui/SuccessModal";

export function ChangeUserName() {
  const titleCtx = useContext(DashboardTitleContext);
  const location = useLocation();
  const navigate = useNavigate();
  const navState = (location.state ?? {}) as {
    user?: { _id?: string; firstname?: string; middlename?: string; lastname?: string };
  };

  const userId = navState.user?._id ?? "";
  const currentFirstname = navState.user?.firstname ?? "";
  const currentMiddlename = navState.user?.middlename ?? "";
  const currentLastname = navState.user?.lastname ?? "";
  const currentFullName = [currentFirstname, currentMiddlename, currentLastname].filter(Boolean).join(" ");

  const [firstname, setFirstname] = useState<string>("");
  const [middlename, setMiddlename] = useState<string>("");
  const [lastname, setLastname] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [twoFAOpen, setTwoFAOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    titleCtx?.setTitle("Change User Name");
    titleCtx?.setBreadcrumb(["User Management", "Change User Name"]);
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

  const newFullName = [firstname.trim(), middlename.trim(), lastname.trim()].filter(Boolean).join(" ");
  const isUnchanged =
    firstname.trim() === currentFirstname &&
    middlename.trim() === currentMiddlename &&
    lastname.trim() === currentLastname;
  const isValid = !!firstname.trim() && !!lastname.trim();

  const handleChangeClick = () => {
    if (!isValid) {
      toast.error('First name and last name are required');
      return;
    }
    if (isUnchanged) {
      toast.error('This is already the user\'s name');
      return;
    }
    if (!reason.trim()) {
      toast.error('A reason is required to change a user\'s name');
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

      const res = await changeUserName(userId, firstname.trim(), middlename.trim(), lastname.trim(), reason.trim(), twoFAToken);
      setSuccessMessage(res.message || 'Name changed.');
      setSuccessOpen(true);
      setFirstname('');
      setMiddlename('');
      setLastname('');
      setReason('');
    } catch (err: any) {
      console.error('Change user name failed', err);
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
            <UserCog className="h-5 w-5" />
            Change User Name
          </CardTitle>
          <CardDescription>
            Update the legal name on file for {currentFullName || 'this user'}. Only do this after
            independently verifying the request came from the account owner.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6 px-4">
          <div className="w-full py-2 flex flex-col justify-center items-start gap-5">

            <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-1 text-sm">Current Name</h4>
              <p className="text-sm text-gray-600">{currentFullName || 'Unknown'}</p>
            </div>

            <div className="w-full space-y-2">
              <Label className="text-sm font-medium text-gray-500" htmlFor="firstname">
                First Name
              </Label>
              <Input
                type="text"
                name="firstname"
                className="w-full py-6 border-gray-300"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                placeholder={currentFirstname || 'First name'}
              />
            </div>

            <div className="w-full space-y-2">
              <Label className="text-sm font-medium text-gray-500" htmlFor="middlename">
                Middle Name (optional)
              </Label>
              <Input
                type="text"
                name="middlename"
                className="w-full py-6 border-gray-300"
                value={middlename}
                onChange={(e) => setMiddlename(e.target.value)}
                placeholder={currentMiddlename || 'Middle name'}
              />
            </div>

            <div className="w-full space-y-2">
              <Label className="text-sm font-medium text-gray-500" htmlFor="lastname">
                Last Name
              </Label>
              <Input
                type="text"
                name="lastname"
                className="w-full py-6 border-gray-300"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                placeholder={currentLastname || 'Last name'}
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
                placeholder="e.g. User provided legal name correction, verified via support ticket #..."
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 w-full">
              <h4 className="font-semibold text-yellow-800 mb-2">Warning</h4>
              <p className="text-sm text-yellow-700">
                This changes the legal name tied to the account's KYC identity.
                Only do this after independently verifying the request came from the account owner.
              </p>
            </div>

            <Button
              className="w-full text-white h-10 bg-orange-600 hover:bg-orange-700"
              onClick={handleChangeClick}
              disabled={actionLoading || !isValid || !reason.trim()}
            >
              {actionLoading ? 'Changing…' : 'Change Name'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className='bg-white w-full max-w-md text-black/90 border border-gray-200 shadow-lg'>
          <DialogHeader>
            <DialogTitle>Confirm Name Change</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">You are about to change this user's name:</p>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p><strong>Current:</strong> {currentFullName || 'Unknown'}</p>
              <p><strong>New:</strong> {newFullName}</p>
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
        title="Confirm name change"
        description={`You are about to change this user's name from "${currentFullName || 'Unknown'}" to "${newFullName}".`}
        loading={actionLoading}
        onClose={() => setTwoFAOpen(false)}
        onConfirm={handleConfirmed}
      />

      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Name Changed"
        message={successMessage}
        details={[]}
        redirectTo={undefined}
        showRedirectButton={false}
      />
    </div>
  );
}

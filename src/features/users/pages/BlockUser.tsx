import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DashboardTitleContext } from "@/layouts/DashboardTitleContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { blockUser, unblockUser, checkUserBlocked } from "../services/usersService";
import { Ban, CheckCircle, AlertCircle } from "lucide-react";
import type { User } from "../types/user";

export function BlockUser() {
  const titleCtx = useContext(DashboardTitleContext);
  const location = useLocation();
  const navigate = useNavigate();
  const navState = (location.state ?? {}) as { user?: User };

  const [userEmail] = useState<string>(() => navState.user?.email ?? "");
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [blockStatus, setBlockStatus] = useState<{
    isBlocked: boolean;
    blockReason?: string;
    blockedAt?: string;
  }>({ isBlocked: false });

  useEffect(() => {
    titleCtx?.setTitle("Block/Unblock User");
    titleCtx?.setBreadcrumb(["User management", "Block User"]);
  }, [titleCtx]);

  // Check current block status
  useEffect(() => {
    const checkStatus = async () => {
      if (!userEmail) return;

      setChecking(true);
      try {
        const response = await checkUserBlocked(userEmail);
        if (response.success && response.user) {
          setBlockStatus({
            isBlocked: response.user.isBlocked,
            blockReason: response.user.blockReason,
            blockedAt: response.user.blockedAt
          });
        }
      } catch (error: any) {
        console.error('Error checking block status:', error);
        toast.error('Failed to check user block status');
      } finally {
        setChecking(false);
      }
    };

    checkStatus();
  }, [userEmail]);

  const handleBlock = async () => {
    if (!userEmail) {
      toast.error("No user email provided");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason for blocking this user");
      return;
    }

    setLoading(true);
    try {
      const response = await blockUser(userEmail, reason);
      if (response.success) {
        toast.success("User blocked successfully");
        setBlockStatus({
          isBlocked: true,
          blockReason: reason,
          blockedAt: new Date().toISOString()
        });
        setReason("");
      }
    } catch (error: any) {
      console.error('Error blocking user:', error);
      toast.error(error?.response?.data?.error || 'Failed to block user');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async () => {
    if (!userEmail) {
      toast.error("No user email provided");
      return;
    }

    setLoading(true);
    try {
      const response = await unblockUser(userEmail);
      if (response.success) {
        toast.success("User unblocked successfully");
        setBlockStatus({ isBlocked: false });
        setReason("");
      }
    } catch (error: any) {
      console.error('Error unblocking user:', error);
      toast.error(error?.response?.data?.error || 'Failed to unblock user');
    } finally {
      setLoading(false);
    }
  };

  if (!userEmail) {
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

  return (
    <div className="w-full max-w-2xl mx-auto px-10 mt-4">
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() => navigate('/users')}
          className="mb-4"
        >
          ← Back to Users
        </Button>
      </div>

      <Card className="border border-gray-200 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5" />
            Block/Unblock User
          </CardTitle>
          <CardDescription>
            Block or unblock user from performing withdrawals and utility transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Email */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">User Email</Label>
            <div className="w-full py-3 px-4 border border-gray-300 rounded bg-gray-50">
              {userEmail}
            </div>
          </div>

          {/* Current Status */}
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Current Status:</span>
              {checking ? (
                <span className="text-gray-500">Checking...</span>
              ) : blockStatus.isBlocked ? (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-600">BLOCKED</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-600">ACTIVE</span>
                </div>
              )}
            </div>

            {blockStatus.isBlocked && blockStatus.blockReason && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Reason: </span>
                  <span className="text-gray-600">{blockStatus.blockReason}</span>
                </div>
                {blockStatus.blockedAt && (
                  <div className="text-xs text-gray-500 mt-1">
                    Blocked on: {new Date(blockStatus.blockedAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Section */}
          {!blockStatus.isBlocked ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
                  Reason for Blocking (Required)
                </Label>
                <Textarea
                  id="reason"
                  name="reason"
                  className="w-full min-h-[100px] border-gray-300"
                  placeholder="Enter the reason for blocking this user..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Warning</h4>
                <p className="text-sm text-yellow-700">
                  Blocking this user will prevent them from:
                </p>
                <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
                  <li>Making withdrawals</li>
                  <li>Purchasing airtime</li>
                  <li>Paying for electricity</li>
                  <li>Betting transactions</li>
                  <li>Cable TV payments</li>
                  <li>Data purchases</li>
                </ul>
              </div>

              <Button
                onClick={handleBlock}
                className="w-full bg-red-600 hover:bg-red-700 text-white h-12"
                disabled={loading || !reason.trim()}
              >
                {loading ? "Blocking..." : "Block User"}
              </Button>
            </>
          ) : (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">✓ Unblock User</h4>
                <p className="text-sm text-green-700">
                  Unblocking this user will restore their ability to perform all transactions including withdrawals and utilities.
                </p>
              </div>

              <Button
                onClick={handleUnblock}
                className="w-full bg-green-600 hover:bg-green-700 text-white h-12"
                disabled={loading}
              >
                {loading ? "Unblocking..." : "Unblock User"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

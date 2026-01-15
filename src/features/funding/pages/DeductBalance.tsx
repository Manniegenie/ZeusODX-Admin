import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardTitleContext } from "@/layouts/DashboardTitleContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { deductBalance } from "@/features/users/services/usersService";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { MinusCircle } from "lucide-react";

export function DeductBalance() {
  const titleCtx = useContext(DashboardTitleContext);
  const location = useLocation();
  const navigate = useNavigate();
  const navState = (location.state ?? {}) as { user?: { email?: string } };

  const [userEmail, setUserEmail] = useState<string>(
    () => navState.user?.email ?? ""
  );
  const [deductLoading, setDeductLoading] = useState(false);
  const [currency, setCurrency] = useState<string>('BTC');
  const [amount, setAmount] = useState<string>('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    titleCtx?.setTitle("Deduct Balance");
    titleCtx?.setBreadcrumb([
      "User Management",
      "Deduct Balance",
    ]);
  }, [titleCtx]);

  const handleDeduct = async () => {
    if (!userEmail) {
      toast.error('Please provide a user email');
      return;
    }
    if (!currency) {
      toast.error('Please select a currency');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setConfirmOpen(true);
  };

  const handleDeductConfirmed = async () => {
    if (!userEmail || !currency || !amount) {
      setConfirmOpen(false);
      return;
    }
    try {
      setDeductLoading(true);
      const res = await deductBalance(userEmail, currency, parseFloat(amount));
      toast.success(res?.message ?? 'Balance deducted successfully');
      setConfirmOpen(false);
      setAmount('');
    } catch (err: any) {
      console.error('deduct failed', err);
      const errorMessage = err?.response?.data?.error || 'Failed to deduct balance';
      toast.error(errorMessage);
    } finally {
      setDeductLoading(false);
    }
  };

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
            <MinusCircle className="h-5 w-5" />
            Deduct User Balance
          </CardTitle>
          <CardDescription>
            Deduct a specific amount from a user's balance
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6 px-4">
          <div className="w-full py-4 flex flex-col justify-center items-start gap-5">
            <div className="w-full space-y-2">
              <Label
                className="text-sm font-medium text-gray-500"
                htmlFor="userEmail"
              >
                User email
              </Label>
              <Input
                type="text"
                name="userEmail"
                className="w-full py-6 border-gray-300"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Enter user email"
              />
            </div>
            <div className="w-full">
              <Label className="text-sm font-medium text-gray-500">Currency</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v)}>
                <SelectTrigger className="w-full h-10 border border-gray-300">
                  <SelectValue placeholder={currency} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {['BTC', 'ETH', 'SOL', 'USDT', 'USDC', 'NGNZ', 'BNB', 'MATIC', 'TRX'].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full space-y-2">
              <Label
                className="text-sm font-medium text-gray-500"
                htmlFor="amount"
              >
                Amount to deduct
              </Label>
              <Input
                type="number"
                name="amount"
                className="w-full py-6 border-gray-300"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                step="any"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 w-full">
              <h4 className="font-semibold text-yellow-800 mb-2">Warning</h4>
              <p className="text-sm text-yellow-700">
                This action will deduct the specified amount from the user's balance.
                The deduction will fail if the user has insufficient balance.
              </p>
            </div>

            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                className="w-1/2 h-10 border border-gray-300"
                onClick={() => {
                  setCurrency('BTC');
                  setAmount('');
                }}
              >
                Reset
              </Button>
              <Button
                className="w-1/2 text-white h-10 bg-red-600 hover:bg-red-700"
                onClick={handleDeduct}
                disabled={deductLoading || !userEmail || !amount}
              >
                {deductLoading ? 'Deducting...' : 'Deduct Balance'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className='bg-white w-full max-w-md text-black/90 border border-gray-200 shadow-lg'>
          <DialogHeader>
            <DialogTitle>Confirm Balance Deduction</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">Are you sure you want to deduct:</p>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p><strong>User:</strong> {userEmail}</p>
              <p><strong>Amount:</strong> {amount} {currency}</p>
            </div>
            <p className="mt-4 text-sm text-red-600">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" className='border border-gray-300' onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeductConfirmed}
              className='bg-red-600 hover:bg-red-700 text-white'
              disabled={deductLoading}
            >
              {deductLoading ? 'Deducting...' : 'Confirm Deduction'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

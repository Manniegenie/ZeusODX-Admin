import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useContext } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useDispatch, useSelector } from "react-redux";
import { fundUserThunk } from "../store/funding.slice";
import type { RootState, AppDispatch } from "@/core/store/store";
import { toast } from "sonner";
import { DashboardTitleContext } from "@/layouts/DashboardTitleContext";

export function FundUserForm() {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((state: RootState) => state.funding?.loading);
  // confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successResult, setSuccessResult] = useState<{ newBalance?: number; message?: string } | null>(null);
  const [form, setForm] = useState({
    email: "",
    currency: "",
    amount: ""
  });
  
  const titleCtx = useContext(DashboardTitleContext);

  useEffect(() => {
    titleCtx?.setTitle('Funding User');
    titleCtx?.setBreadcrumb([
      'Funding & Balances',
      'Fund User',
    ]);
  }, [titleCtx]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.currency || !form.amount) return;
    
    // Show confirmation dialog directly
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmLoading(true);
    try {
      const result = await dispatch(fundUserThunk({
        email: form.email,
        currency: form.currency,
        amount: Number(form.amount)
      }));
      
      if ('error' in result) {
        const errorMsg = result.payload || result.error?.message || 'Funding failed';
        toast.error(typeof errorMsg === 'string' ? errorMsg : 'Funding failed');
      } else if (result.payload) {
        const payload = result.payload as any;
        if (payload.success) {
          toast.success(payload.message);
          setConfirmOpen(false);
          setForm({ email: '', currency: '', amount: '' });
          setSuccessResult({ 
            newBalance: payload.data?.newBalance, 
            message: payload.message 
          });
          setSuccessOpen(true);
        } else {
          toast.error(payload.message || 'Funding failed');
        }
      } else {
        toast.error('Unknown error occurred');
      }
    } catch (err) {
      console.error('confirm funding failed', err);
      toast.error('Funding failed');
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl border border-gray-200 shadow-none">
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6 p-8">
            <div className="grid gap-2">
              <Label htmlFor="userEmail">User Email</Label>
              <Input
                id="userEmail"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                className="border border-gray-200 h-12 shadow-none"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                name="currency"
                className="border border-gray-200 h-12 shadow-none rounded px-2"
                aria-label="Currency"
                required
                value={form.currency}
                onChange={handleChange}
              >
                <option value="">Select currency</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="SOL">SOL</option>
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
                <option value="BNB">BNB</option>
                <option value="MATIC">MATIC</option>
                <option value="TRX">TRX</option>
                <option value="NGNZ">NGNZ</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                required
                className="border border-gray-200 h-12 shadow-none"
                value={form.amount}
                onChange={handleChange}
                min={0.000001}
                step="any"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-white font-medium"
              disabled={loading || confirmLoading}
            >
              {loading ? "Funding..." : "Fund User"}
            </Button>
          </div>
        </form>
      </CardContent>
      
      <Dialog open={confirmOpen} onOpenChange={(v) => setConfirmOpen(v)}>
        <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm fund user</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-sm">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Email:</strong> {form.email}</li>
              <li><strong>Amount to add:</strong> {form.amount} {form.currency}</li>
              <li><strong>Operation:</strong> Fund user account</li>
            </ul>
          </div>
          <DialogFooter>
            <div className="flex gap-2">
              <Button className="text-red-500 border border-red-500"  onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button className="text-white" disabled={confirmLoading} onClick={handleConfirm}>{confirmLoading ? 'Funding...' : 'Confirm and Fund'}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={successOpen} onOpenChange={(v) => setSuccessOpen(v)}>
        <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-md">
          <DialogHeader>
            <DialogTitle>Funding successful</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-sm">
            <div className="space-y-2">
              <div>{successResult?.message ?? 'Funding completed'}</div>
              <div><strong>New balance:</strong> {successResult?.newBalance ?? '—'}</div>
            </div>
          </div>
          <DialogFooter>
            <div className="flex gap-2">
              <Button onClick={() => setSuccessOpen(false)}>Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
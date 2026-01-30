import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardTitleContext } from "@/layouts/DashboardTitleContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { regenerateWalletsByPhone } from "@/features/users/services/usersService";
import { useLocation } from 'react-router-dom';
import { toast } from "sonner";
import { fetchUserWallets } from '@/features/users/services/usersService';
// no dialog used on this page
// select UI not used

export function RegenerateWalletByPhone() {
  const titleCtx = useContext(DashboardTitleContext);
  interface RouteState { state?: { user?: { phonenumber?: string; tokens?: string[] } } }

  const location = useLocation();
  const stateUser = ((location as unknown) as RouteState).state?.user;
  const [phonenumber, setPhonenumber] = useState(stateUser?.phonenumber || "");
  const availableTokens = ["BTC_BTC", "ETH_ETH", "SOL_SOL", "USDT_USDT", "USDC_USDC", "NGNZ_NGNZ"];
  const [selectedTokens, setSelectedTokens] = useState<string[]>(stateUser?.tokens ?? []);
  const [force, setForce] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown | null>(null);

  useEffect(() => {
    titleCtx?.setTitle("Regenerate wallets by phone");
    titleCtx?.setBreadcrumb([
      "User Management",
      "User Account",
      "Regenerate wallets",
    ]);
  }, [titleCtx]);

  const handleRegenerate = async () => {
    try {
      if (!phonenumber) {
        toast.error('Phone number is required');
        return;
      }
      const tokenList = selectedTokens.map(s => s.trim()).filter(Boolean);
      if (tokenList.length === 0) {
        toast.error('Provide at least one token');
        return;
      }
      setLoading(true);
      const res = await regenerateWalletsByPhone(phonenumber, tokenList, force);
      setResult(res);
      // refresh wallets for user by email if available - best effort
      try {
        if ((res?.user?.email)) {
          await fetchUserWallets(res.user.email);
        }
      } catch (err) {
        // non-fatal
        console.debug('refresh wallets failed', err);
      }
      toast.success(res?.message || 'Wallets regenerated');
    } catch (err) {
      console.error('Regenerate failed', err);
      toast.error('Failed to regenerate wallets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 space-y-6">
      <Card className="border border-gray-200 shadow-none">
        <CardContent className="py-12 px-6">
          <div className="w-full flex flex-col justify-center items-start gap-8">
            <div className="flex flex-col gap-2 items-start justify-center w-full">
              <Label className="w-full text-gray-800" htmlFor="phonenumber">
                Phone number
              </Label>
              <Input
                type="text"
                name="phonenumber"
                placeholder="+1234567890"
                className="w-full h-12 border border-gray-200 shadow-none"
                required
                value={phonenumber}
                onChange={(e) => setPhonenumber(e.target.value)}
              />
            </div>
            <div className="w-full">
              <Label className="text-sm font-medium text-gray-500" htmlFor="tokens">Tokens</Label>
              <div className="grid grid-cols-3 gap-2">
                {availableTokens.map((t) => (
                  <label key={t} className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedTokens.includes(t)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedTokens((s) => [...s, t]);
                        else setSelectedTokens((s) => s.filter((x) => x !== t));
                      }}
                    />
                    <span className="text-sm">{t.split('_')[0]}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="w-full">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} />
                <span className="text-sm">Force regenerate</span>
              </label>
            </div>
            <Button onClick={handleRegenerate} disabled={loading} className="flex h-12 w-full text-white items-center gap-2">
              {loading ? 'Regenerating...' : 'Regenerate'}
            </Button>
            {result !== null && <pre className="mt-3 bg-gray-50 p-2 text-xs">{String(JSON.stringify(result, null, 2))}</pre>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
// Removed dialog for password PIN

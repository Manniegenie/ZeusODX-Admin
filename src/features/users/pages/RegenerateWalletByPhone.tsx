import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardTitleContext } from "@/layouts/DashboardTitleContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { regenerateWalletsByPhone } from "@/features/users/services/usersService";
import { useLocation } from 'react-router-dom';
import { toast } from "sonner";

// All valid wallet schema keys grouped by currency
const TOKEN_GROUPS = [
  {
    label: 'Bitcoin',
    tokens: ['BTC_BTC', 'BTC_BSC'],
  },
  {
    label: 'Ethereum',
    tokens: ['ETH_ETH', 'ETH_ARBITRUM', 'ETH_BASE', 'ETH_BSC'],
  },
  {
    label: 'Solana',
    tokens: ['SOL_SOL'],
  },
  {
    label: 'USDT',
    tokens: ['USDT_ETH', 'USDT_TRX', 'USDT_BSC', 'USDT_ARBITRUM', 'USDT_BASE', 'USDT_SOL'],
  },
  {
    label: 'USDC',
    tokens: ['USDC_ETH', 'USDC_BSC', 'USDC_TRX', 'USDC_ARBITRUM', 'USDC_BASE', 'USDC_SOL', 'USDC_POLYGON'],
  },
  {
    label: 'BNB',
    tokens: ['BNB_ETH', 'BNB_BSC'],
  },
  {
    label: 'MATIC',
    tokens: ['MATIC_ETH', 'MATIC_ARBITRUM'],
  },
  {
    label: 'TRX',
    tokens: ['TRX_TRX'],
  },
  {
    label: 'TON',
    tokens: ['TON_TON'],
  },
];

const ALL_TOKENS = TOKEN_GROUPS.flatMap(g => g.tokens);

export function RegenerateWalletByPhone() {
  const titleCtx = useContext(DashboardTitleContext);

  const location = useLocation();
  const stateUser = (location.state as any)?.user;

  const [phonenumber, setPhonenumber] = useState<string>(stateUser?.phonenumber || "");
  const [email, setEmail] = useState<string>(stateUser?.email || "");
  const [selectedTokens, setSelectedTokens] = useState<string[]>(stateUser?.tokens ?? []);
  const [force, setForce] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown | null>(null);

  useEffect(() => {
    titleCtx?.setTitle("Regenerate Wallets");
    titleCtx?.setBreadcrumb(["User Management", "Regenerate Wallets"]);
  }, [titleCtx]);

  const toggleToken = (token: string) => {
    setSelectedTokens(prev =>
      prev.includes(token) ? prev.filter(t => t !== token) : [...prev, token]
    );
  };

  const selectGroup = (tokens: string[]) => {
    setSelectedTokens(prev => {
      const allSelected = tokens.every(t => prev.includes(t));
      return allSelected
        ? prev.filter(t => !tokens.includes(t))
        : [...new Set([...prev, ...tokens])];
    });
  };

  const handleRegenerate = async () => {
    if (!phonenumber && !email) {
      toast.error('Phone number or email is required');
      return;
    }
    if (selectedTokens.length === 0) {
      toast.error('Select at least one wallet to regenerate');
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      // server accepts phonenumber OR email — send whichever is available
      const res = await regenerateWalletsByPhone(phonenumber || email, selectedTokens, force);
      setResult(res);
      toast.success(res?.message || 'Wallets regenerated successfully');
    } catch (err: any) {
      console.error('Regenerate failed', err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to regenerate wallets';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Regenerate Wallet Addresses</CardTitle>
          <CardDescription>
            Select the wallets to regenerate for a specific user. Use Force to overwrite existing addresses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Identifier inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="phonenumber">Phone Number</Label>
              <Input
                id="phonenumber"
                type="text"
                placeholder="+2348100000000"
                value={phonenumber}
                onChange={(e) => setPhonenumber(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email (alternative)</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Token selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Select Wallets to Regenerate</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-xs text-blue-600 underline"
                  onClick={() => setSelectedTokens([...ALL_TOKENS])}
                >
                  Select all
                </button>
                <button
                  type="button"
                  className="text-xs text-gray-500 underline"
                  onClick={() => setSelectedTokens([])}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {TOKEN_GROUPS.map(group => (
                <div key={group.label} className="border rounded-md p-3 space-y-2">
                  <button
                    type="button"
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 flex items-center gap-1"
                    onClick={() => selectGroup(group.tokens)}
                  >
                    {group.label}
                    <span className="text-xs text-gray-400 font-normal">
                      ({group.tokens.filter(t => selectedTokens.includes(t)).length}/{group.tokens.length})
                    </span>
                  </button>
                  <div className="flex flex-wrap gap-3">
                    {group.tokens.map(token => (
                      <label key={token} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTokens.includes(token)}
                          onChange={() => toggleToken(token)}
                          className="h-4 w-4"
                        />
                        <span className="text-xs text-gray-600">{token}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Force flag */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={force}
              onChange={(e) => setForce(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm">Force regenerate (overwrite existing addresses)</span>
          </label>

          <Button
            onClick={handleRegenerate}
            disabled={loading || selectedTokens.length === 0 || (!phonenumber && !email)}
            className="w-full h-11"
          >
            {loading ? 'Regenerating...' : `Regenerate ${selectedTokens.length > 0 ? `(${selectedTokens.length} wallet${selectedTokens.length > 1 ? 's' : ''})` : ''}`}
          </Button>

          {result !== null && (
            <pre className="bg-gray-50 rounded p-3 text-xs overflow-auto max-h-64">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

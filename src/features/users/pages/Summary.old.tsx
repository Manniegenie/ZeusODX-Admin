import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { RefreshCcw } from "lucide-react";
import { DashboardTitleContext } from "@/layouts/DashboardTitleContext";
import type { FetchWalletsResponse } from "@/features/users/types/userApi.types";
import { WalletList } from "@/features/funding/components/WalletList";
import { getCompleteUserSummary } from "@/features/users/services/usersService";
import { toast } from "sonner";

export function Summary() {
  const titleCtx = useContext(DashboardTitleContext);
  const location = useLocation();
  const navState = (location.state ?? {}) as { user?: { email?: string } };

  const [userEmail] = useState<string>(
    () => navState.user?.email ?? ""
  );
  const [walletData, setWalletData] = useState<FetchWalletsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("—");

  useEffect(() => {
    titleCtx?.setTitle("Summary");
    titleCtx?.setBreadcrumb([
      "User management",
      "User Summary",
    ]);
  }, [titleCtx]);

  // Fetch user summary data
  useEffect(() => {
    const fetchSummary = async () => {
      if (!userEmail) {
        return;
      }

      setLoading(true);
      try {
        const response = await getCompleteUserSummary(userEmail);
        if (response.success && response.data) {
          // Transform the data to match FetchWalletsResponse format for WalletList
          const transformedData: FetchWalletsResponse = {
            email: response.data.user.email,
            wallets: response.data.wallets,
            balances: response.data.balances
          };
          setWalletData(transformedData);
          
          // Format last updated date
          if (response.data.lastUpdated) {
            const date = new Date(response.data.lastUpdated);
            setLastUpdated(date.toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            }));
          }
        }
      } catch (error: any) {
        console.error('Error fetching user summary:', error);
        toast.error(error?.response?.data?.error || 'Failed to fetch user summary');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [userEmail]);

  return (
    <div className="w-full px-10">
      {/* <div className="w-full max-w-2xl mx-auto mt-4 space-y-6">
        <Card className="border border-gray-200 shadow-none">
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
                />
              </div>

              <div className="w-full space-y-2">
                <Label className="text-sm font-medium text-gray-500" htmlFor="tokens">
                  Tokens
                </Label>
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

              <Button
                onClick={handleSearch}
                className="flex h-12 w-full text-white items-center gap-2"
                disabled={loading}
              >
                <Wallet className="h-4 w-4" />
                {loading ? "Fetching…" : "Fetch Wallet"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div> */}
      <div className="w-full mt-4 space-y-6">
        {/* <div className="w-full flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              type="text"
              name="search"
              placeholder="Search token or address"
              className="pl-10 py-4 w-75 border border-gray-200 shadow-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            className="bg-primary text-white flex w-fit items-center justify-center gap-2"
            onClick={() => exportCsv()}
            disabled={!walletData}
          >
            <File className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div> */}
        {/* style={{ backgroundImage: `url(${Bg})` }}  */}
        <div
          className="w-full h-60 rounded-md flex justify-between items-center text-white px-6 py-6 bg-primary"
          id="wallet-summary"
        >
          <div className="flex flex-col items-start gap-12 h-full text-xs space-y-2">
            <div className="h-fit flex flex-col items-start justify-start">
              <span className="font-semibold text-[20px]">
                User summary
              </span>
              <span className="text-xs text-sm font-light">
                User email: {userEmail || "—"}
              </span>
            </div>
            <div className="h-full">
              <span className="flex items-center justify-start gap-2">
                <span className="text-[50px] font-semibold">
                  {loading ? (
                    'Loading...'
                  ) : (
                    (() => {
                      if (!walletData?.balances) return '—';
                      // Use totalPortfolioBalance if available, otherwise calculate
                      if (walletData.balances.totalPortfolioBalance !== undefined) {
                        return walletData.balances.totalPortfolioBalance.toLocaleString(undefined, { 
                          maximumFractionDigits: 2,
                          minimumFractionDigits: 2
                        });
                      }
                      // Fallback: sum raw numeric balances (not pending)
                      const vals = Object.entries(walletData.balances)
                        .filter(([k]) => /balance$/i.test(k) && !/pending/i.test(k))
                        .map(([, val]) => Number(val) || 0);
                      const sum = vals.reduce((a, b) => a + b, 0);
                      return sum.toLocaleString(undefined, { maximumFractionDigits: 2 });
                    })()
                  )}
                </span>
                <RefreshCcw 
                  className={`h-4 w-4 text-white ${loading ? 'animate-spin' : ''}`}
                />
              </span>
              <span>Total Portfolio Value</span>
            </div>
          </div>
          <div className="flex flex-col items-end justify-start h-full text-xs">
            <span>Last Updated</span>
            <span>{lastUpdated}</span>
          </div>
        </div>
          {/* compute filtered data for display */}
          <WalletList data={walletData} />
      </div>
    </div>
  );
}

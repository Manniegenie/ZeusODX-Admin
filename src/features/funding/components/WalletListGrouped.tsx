import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Copy, ScanBarcode } from "lucide-react"
import type { FetchWalletsResponse, WalletEntry } from '@/features/users/types/userApi.types';
import { toast } from 'sonner';

// Map of currency symbols to full names
const CURRENCY_NAMES: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  SOL: 'Solana',
  USDT: 'Tether',
  USDC: 'USD Coin',
  BNB: 'Binance Coin',
  MATIC: 'Polygon',
  TRX: 'Tron',
  NGNZ: 'NGNZ',
  AVAX: 'Avalanche'
};

interface GroupedWallet {
  currency: string;
  fullName: string;
  balance: number;
  balanceUSD: number;
  pendingBalance: number;
  networks: Array<{
    network: string;
    address: string;
    walletReferenceId?: string;
  }>;
}

export function WalletListGrouped({ data }: { data?: FetchWalletsResponse | null }) {
  const handleCopy = async (address?: string) => {
    if (!address) {
      toast.error('No address to copy');
      return;
    }
    try {
      await navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
    } catch (err) {
      console.error('clipboard error', err);
      toast.error('Failed to copy address');
    }
  };

  const handleScan = (address?: string) => {
    if (!address) {
      toast.error('No address to generate QR');
      return;
    }
    // Open a QR image in a new tab using Google Chart API
    const url = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  if (!data) {
    return <div></div>;
  }

  // Group wallets by currency
  const groupedWallets: Record<string, GroupedWallet> = {};

  Object.entries(data.wallets).forEach(([token, entry]) => {
    // Parse token format: "BTC_BTC", "USDT_ETH", "USDT_TRX", etc.
    const parts = token.split('_');
    const currency = parts[0]; // BTC, USDT, ETH, etc.
    const network = parts[1] || parts[0]; // BTC, ETH, TRX, BSC, etc.

    if (!groupedWallets[currency]) {
      const currencyLower = currency.toLowerCase();
      groupedWallets[currency] = {
        currency,
        fullName: CURRENCY_NAMES[currency] || currency,
        balance: data.balances?.[`${currencyLower}Balance`] ?? 0,
        balanceUSD: data.balances?.[`${currencyLower}BalanceUSD`] ?? 0,
        pendingBalance: data.balances?.[`${currencyLower}PendingBalance`] ?? 0,
        networks: []
      };
    }

    groupedWallets[currency].networks.push({
      network,
      address: (entry as WalletEntry).address,
      walletReferenceId: (entry as WalletEntry).walletReferenceId
    });
  });

  // Sort by currency name
  const sortedWallets = Object.values(groupedWallets).sort((a, b) =>
    a.currency.localeCompare(b.currency)
  );

  return (
    <Accordion type="single" collapsible className="w-full space-y-1">
      {sortedWallets.map((wallet) => (
        <AccordionItem key={wallet.currency} value={wallet.currency} className="border-b-0">
          <AccordionTrigger className="border border-gray-200 px-4">
            <div className="flex items-center justify-between w-full pr-4">
              <span className="font-semibold">{wallet.currency} - {wallet.fullName}</span>
              <span className="text-sm text-gray-600">
                {wallet.balance.toLocaleString(undefined, { maximumFractionDigits: 8 })} {wallet.currency}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance border border-gray-200 p-8">
            {/* Balance Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-lg mb-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-[40px] font-semibold text-gray-900">
                    {wallet.balance.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                  </span>
                  <span className="text-2xl font-medium text-gray-600">{wallet.currency}</span>
                </div>
                <div className="text-xl text-gray-700">
                  ≈ ${wallet.balanceUSD.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })} USD
                </div>
                {wallet.pendingBalance > 0 && (
                  <div className="text-sm text-orange-600 mt-2">
                    Pending: {wallet.pendingBalance.toLocaleString(undefined, { maximumFractionDigits: 8 })} {wallet.currency}
                  </div>
                )}
              </div>
            </div>

            {/* Network Addresses */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700">Wallet Addresses by Network</h4>
              {wallet.networks.map((networkWallet, idx) => (
                <div
                  key={`${wallet.currency}-${networkWallet.network}-${idx}`}
                  className="bg-gray-50 border border-gray-200 p-4 rounded flex flex-col gap-4 items-start justify-center md:flex-row md:justify-between md:items-center w-full"
                >
                  <div className="w-full md:w-auto flex flex-col justify-center items-start gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                        {networkWallet.network}
                      </span>
                      {wallet.networks.length === 1 && (
                        <span className="text-xs text-gray-500">Native Network</span>
                      )}
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-700 font-medium">Address: </span>
                      <span className="font-mono text-gray-900 break-all">{networkWallet.address}</span>
                    </div>
                    {networkWallet.walletReferenceId && (
                      <div className="text-xs text-gray-500">
                        Ref ID: {networkWallet.walletReferenceId}
                      </div>
                    )}
                  </div>
                  <div className="w-full md:w-auto flex items-center gap-3">
                    <Button
                      className="flex-1 md:flex-none text-white bg-primary font-normal"
                      onClick={() => handleCopy(networkWallet.address)}
                    >
                      <Copy className="h-4 w-4 mr-2"/> Copy
                    </Button>
                    <Button
                      className="flex-1 md:flex-none text-white bg-black font-normal"
                      onClick={() => handleScan(networkWallet.address)}
                    >
                      <ScanBarcode className="h-4 w-4 mr-2"/> QR
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Network Count Summary */}
            <div className="text-xs text-gray-500 mt-2 text-right">
              {wallet.networks.length} network{wallet.networks.length !== 1 ? 's' : ''} supported
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

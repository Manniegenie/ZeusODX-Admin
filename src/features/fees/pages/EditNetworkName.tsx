import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CryptoFee } from "../type/fee";
import { DashboardTitleContext } from "@/layouts/DashboardTitleContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateCryptoNetworkName, fetchCryptoFees } from '../store/cryptoFeeSlice';
import { toast } from 'sonner';

export function EditNetworkName() {
  const titleCtx = useContext(DashboardTitleContext);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const stateFee = (location.state as any)?.fee as CryptoFee | undefined;
    const [selectedCurrency, setSelectedCurrency] = useState<string>(stateFee?.currency ?? '');
    const [selectedNetwork, setSelectedNetwork] = useState<string>(stateFee?.network ?? '');
    const [networkName, setNetworkName] = useState<string>(stateFee?.networkName ?? '');
  
      useEffect(() => {
        titleCtx?.setTitle('Update Network Name');
        titleCtx?.setBreadcrumb([
          'Fees & Rates',
          'Crypto Fees',
          'Update network name',
        ]);
      }, [titleCtx]);
  
    // TODO: Replace with actual data from your API
    const currencies = ['BTC', 'ETH', 'SOL', 'USDT', 'USDC', 'BNB', 'MATIC', 'TRX', 'TON'];
    const networks = ['Bitcoin', 'Ethereum', 'Tron'];
  
    // No separate search helper — page pre-fills from router state or user input

    const handleSave = async () => {
      const currency = selectedCurrency.trim();
      const network = selectedNetwork.trim();
      if (!currency || !network) {
        toast.error('Currency and network are required');
        return;
      }
      try {
        const payload = { currency, network, networkName: networkName.trim() };
        // @ts-ignore
        const res = await dispatch(updateCryptoNetworkName(payload)).unwrap();
        toast.success(res?.message ?? 'Network name updated');
        // refresh list
        // @ts-ignore
        dispatch(fetchCryptoFees());
        navigate(-1);
      } catch (err) {
        console.error('update network name failed', err);
        toast.error('Failed to update network name');
      }
    };

  // if (!fee) {
  //   return <div>No fee data provided</div>;
  // }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 space-y-6">
      <Card className='border border-gray-200 shadow-none'>
        <CardContent className="py-6 px-4">
          <div className="w-full py-8 flex flex-col justify-center items-start gap-8">
            <div className="w-full space-y-2">
              <Label className="text-sm font-medium text-gray-500" htmlFor="">Currency</Label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency} disabled>
                <SelectTrigger className='w-full border border-gray-300 py-6'>
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent className='w-full border border-gray-300 bg-white'>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full space-y-2">
              <Label className="text-sm font-medium text-gray-500" htmlFor="">Network</Label>
              <Select value={selectedNetwork} onValueChange={setSelectedNetwork} disabled>
                <SelectTrigger className='w-full border border-gray-300 py-6'>
                  <SelectValue placeholder="Select Network" />
                </SelectTrigger>
                <SelectContent className='w-full bg-white border border-gray-300'>
                  {networks.map((network) => (
                    <SelectItem key={network} value={network}>
                      {network}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


            <div className="w-full space-y-2">
              <Label className="text-sm font-medium text-gray-500" htmlFor="networkName">Network name</Label>
              <Input
                type="text"
                name="networkName"
                value={networkName}
                onChange={(e) => setNetworkName(e.target.value)}
                className="w-full py-6 border-gray-300"
              />
            </div>
            <div className="grip w-full grid-cols-2 gap-4 md:grid">
              <Button onClick={() => navigate(-1)} className="bg-white flex h-12 w-full md:w-full text-primary border border-green-600 items-center gap-2">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex h-12 w-full md:w-full text-white items-center gap-2">
                Save changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

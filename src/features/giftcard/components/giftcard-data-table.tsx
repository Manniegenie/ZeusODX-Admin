import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RefreshCw, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import type { GiftCardRate } from '../types/giftcard';

interface GiftCardDataTableProps {
  data: GiftCardRate[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRates: number;
    limit: number;
  };
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onEdit: (rate: GiftCardRate) => void;
  onDelete: (rate: GiftCardRate) => void;
  onToggleStatus: (rate: GiftCardRate) => void;
}

export function GiftCardDataTable({
  data,
  pagination,
  onPageChange,
  onRefresh,
  onEdit,
  onDelete,
  onToggleStatus
}: GiftCardDataTableProps) {
  const { currentPage, totalPages, totalRates, limit } = pagination;

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get country flag
  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'US': '🇺🇸',
      'CANADA': '🇨🇦',
      'AUSTRALIA': '🇦🇺',
      'SWITZERLAND': '🇨🇭'
    };
    return flags[country] || '🌍';
  };

  // Helper function to format card type display name
  const getCardTypeDisplayName = (cardType: string) => {
    const typeMap: { [key: string]: string } = {
      'APPLE': 'Apple',
      'APPLE/ITUNES': 'Apple/iTunes',
      'STEAM': 'Steam',
      'NORDSTROM': 'Nordstrom',
      'MACY': "Macy's",
      'NIKE': 'Nike',
      'GOOGLE_PLAY': 'Google Play',
      'AMAZON': 'Amazon',
      'VISA': 'Visa',
      'VANILLA': 'Vanilla',
      'RAZOR_GOLD': 'Razor Gold',
      'AMERICAN_EXPRESS': 'American Express',
      'SEPHORA': 'Sephora',
      'FOOTLOCKER': 'Foot Locker',
      'XBOX': 'Xbox',
      'EBAY': 'eBay'
    };
    return typeMap[cardType] || cardType;
  };

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalRates)} of {totalRates} rates
        </div>
        <Button
          onClick={onRefresh}
          size="sm"
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Card Type</TableHead>
              <TableHead className="font-semibold">Country</TableHead>
              <TableHead className="font-semibold">Base Rate</TableHead>
              <TableHead className="font-semibold">Physical Rate</TableHead>
              <TableHead className="font-semibold">E-Code Rate</TableHead>
              <TableHead className="font-semibold">Range</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Last Updated</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  No gift card rates found
                </TableCell>
              </TableRow>
            ) : (
              data.map((rate) => (
                <TableRow key={rate.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{getCardTypeDisplayName(rate.cardType)}</div>
                      {rate.vanillaType && (
                        <div className="text-xs text-gray-500">Type: {rate.vanillaType}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getCountryFlag(rate.country)}</span>
                      <span className="font-medium">{rate.country}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{rate.rateDisplay}</div>
                      <div className="text-xs text-gray-500">
                        {rate.sourceCurrency} → {rate.targetCurrency}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {rate.physicalRate ? (
                        <span className="font-medium">₦{rate.physicalRate}/{rate.sourceCurrency}</span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {rate.ecodeRate ? (
                        <span className="font-medium">₦{rate.ecodeRate}/{rate.sourceCurrency}</span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {rate.sourceCurrency} {rate.minAmount} - {rate.maxAmount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {rate.isActive ? (
                        <ToggleRight className="w-5 h-5 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-gray-400" />
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rate.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rate.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {rate.lastUpdated ? formatDate(rate.lastUpdated) : formatDate(rate.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(rate)}
                        className="h-8 w-8 p-0"
                        title="Edit rate"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleStatus(rate)}
                        className="h-8 w-8 p-0"
                        title={rate.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {rate.isActive ? (
                          <ToggleLeft className="h-4 w-4 text-gray-600" />
                        ) : (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(rate)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        title="Delete rate"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import type { GiftCardRate } from '../types/giftcard';

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

interface GiftCardColumnsProps {
  onEdit: (rate: GiftCardRate) => void;
  onDelete: (rate: GiftCardRate) => void;
  onToggleStatus: (rate: GiftCardRate) => void;
}

export const createColumns = ({
  onEdit,
  onDelete,
  onToggleStatus
}: GiftCardColumnsProps): ColumnDef<GiftCardRate>[] => [
  {
    accessorKey: 'cardType',
    header: 'Card Type',
    cell: ({ row }) => {
      const rate = row.original;
      return (
        <div className="text-black">
          <div className="font-medium text-black">{getCardTypeDisplayName(rate.cardType)}</div>
          {rate.vanillaType && (
            <div className="text-xs text-gray-600">Type: {rate.vanillaType}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'country',
    header: 'Country',
    cell: ({ row }) => {
      const rate = row.original;
      return (
        <div className="flex items-center gap-2 text-black">
          <span className="text-xl">{getCountryFlag(rate.country)}</span>
          <span className="font-medium text-black">{rate.country}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'rate',
    header: 'Base Rate',
    cell: ({ row }) => {
      const rate = row.original;
      return (
        <div className="text-black">
          <div className="font-medium text-black">{rate.rateDisplay}</div>
          <div className="text-xs text-gray-600">
            {rate.sourceCurrency} → {rate.targetCurrency}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'physicalRate',
    header: 'Physical Rate',
    cell: ({ row }) => {
      const rate = row.original;
      return (
        <div className="text-sm text-black">
          {rate.physicalRate ? (
            <span className="font-medium text-black">₦{rate.physicalRate}/{rate.sourceCurrency}</span>
          ) : (
            <span className="text-gray-500">N/A</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'ecodeRate',
    header: 'E-Code Rate',
    cell: ({ row }) => {
      const rate = row.original;
      return (
        <div className="text-sm text-black">
          {rate.ecodeRate ? (
            <span className="font-medium text-black">₦{rate.ecodeRate}/{rate.sourceCurrency}</span>
          ) : (
            <span className="text-gray-500">N/A</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'range',
    header: 'Amount Range',
    cell: ({ row }) => {
      const rate = row.original;
      return (
        <div className="text-sm text-black">
          <div className="text-black">{rate.sourceCurrency} {rate.minAmount} - {rate.maxAmount}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const rate = row.original;
      return (
        <div className="flex items-center gap-2">
          {rate.isActive ? (
            <ToggleRight className="w-5 h-5 text-[#00C851]" />
          ) : (
            <ToggleLeft className="w-5 h-5 text-[#9B9B9B]" />
          )}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            rate.isActive ? 'bg-[#e6f7ed] text-[#00C851]' : 'bg-gray-100 text-gray-800'
          }`}>
            {rate.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'lastUpdated',
    header: 'Last Updated',
    cell: ({ row }) => {
      const rate = row.original;
      return (
        <div className="text-sm text-gray-700">
          {rate.lastUpdated ? formatDate(rate.lastUpdated) : formatDate(rate.createdAt)}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const rate = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => onEdit(rate)}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleStatus(rate)}
            className="flex items-center gap-1"
          >
            {rate.isActive ? (
              <>
                <ToggleLeft className="h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <ToggleRight className="h-4 w-4" />
                Activate
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(rate)}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      );
    },
  },
];

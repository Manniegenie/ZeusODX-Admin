import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import type { GiftCardSubmission, SubmissionStatus } from '../types/giftcard';

const getStatusBadge = (status: SubmissionStatus) => {
  const variants = {
    PENDING: { variant: 'secondary' as const, label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
    REVIEWING: { variant: 'default' as const, label: 'Reviewing', className: 'bg-blue-100 text-blue-800' },
    APPROVED: { variant: 'default' as const, label: 'Approved', className: 'bg-green-100 text-green-800' },
    REJECTED: { variant: 'destructive' as const, label: 'Rejected', className: 'bg-red-100 text-red-800' },
    PAID: { variant: 'default' as const, label: 'Paid', className: 'bg-emerald-100 text-emerald-800' },
  };

  const config = variants[status] || variants.PENDING;
  return <Badge className={config.className}>{config.label}</Badge>;
};

export const submissionColumns = (
  onView: (submission: GiftCardSubmission) => void
): ColumnDef<GiftCardSubmission>[] => [
  {
    accessorKey: 'createdAt',
    header: 'Submitted',
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      let timeAgo = '';
      if (diffDays > 0) {
        timeAgo = `${diffDays}d ago`;
      } else if (diffHours > 0) {
        timeAgo = `${diffHours}h ago`;
      } else if (diffMins > 0) {
        timeAgo = `${diffMins}m ago`;
      } else {
        timeAgo = 'just now';
      }

      return (
        <div className="text-sm">
          <div className="font-medium">{date.toLocaleDateString()}</div>
          <div className="text-gray-500 text-xs">{timeAgo}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'userId',
    header: 'User',
    cell: ({ row }) => {
      const user = row.original.userId;
      return (
        <div className="text-sm">
          <div className="font-medium">{user.firstname} {user.lastname}</div>
          <div className="text-gray-500 text-xs">{user.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'cardType',
    header: 'Card Type',
    cell: ({ row }) => (
      <div className="text-sm">
        <div className="font-medium">{row.original.cardType}</div>
        <div className="text-gray-500 text-xs">
          {row.original.country} · {row.original.cardFormat}
          {row.original.vanillaType && ` · ${row.original.vanillaType}`}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'cardValue',
    header: 'Value',
    cell: ({ row }) => (
      <div className="text-sm font-medium">
        {row.original.currency} {row.original.cardValue.toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: 'expectedAmountToReceive',
    header: 'Expected NGN',
    cell: ({ row }) => (
      <div className="text-sm">
        <div className="font-medium">
          ₦{row.original.expectedAmountToReceive.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </div>
        <div className="text-gray-500 text-xs">
          @ {row.original.expectedRateDisplay}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'totalImages',
    header: 'Images',
    cell: ({ row }) => (
      <div className="text-sm text-center">
        <Badge variant="outline">{row.original.totalImages}</Badge>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => getStatusBadge(row.original.status),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onView(row.original)}
          className="flex items-center gap-1"
        >
          <Eye className="h-4 w-4" />
          View
        </Button>
      </div>
    ),
  },
];

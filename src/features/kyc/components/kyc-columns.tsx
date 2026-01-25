import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import type { KYCEntry } from '../types/kyc';

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'rejected':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'pending':
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'provisional':
      return <AlertCircle className="w-4 h-4 text-orange-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-500" />;
  }
};

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'provisional':
      return 'bg-orange-100 text-orange-800';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to format ID number (mask sensitive parts)
const formatIdNumber = (idNumber: string) => {
  if (!idNumber) return 'N/A';
  
  // Show only first 4 and last 4 characters for security
  if (idNumber.length > 8) {
    return `${idNumber.slice(0, 4)}****${idNumber.slice(-4)}`;
  }
  return idNumber;
};

// Helper function to get ID type display name
const getIdTypeDisplayName = (idType: string) => {
  const typeMap: { [key: string]: string } = {
    'bvn': 'BVN',
    'national_id': 'National ID',
    'passport': 'Passport',
    'drivers_license': "Driver's License",
    'nin': 'NIN',
    'nin_slip': 'NIN Slip',
    'voter_id': 'Voter ID'
  };
  return typeMap[idType] || idType;
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

export const columns: ColumnDef<KYCEntry>[] = [
  {
    accessorKey: 'user',
    header: 'User',
    cell: ({ row }) => {
      const entry = row.original;
      return (
        <div>
          <div className="font-medium">
            {entry.user.firstname} {entry.user.lastname}
          </div>
          <div className="text-sm text-gray-600 normal-case">{entry.user.email}</div>
          <div className="text-sm text-gray-500">{entry.user.phonenumber}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'frontendIdType',
    header: 'ID Type',
    cell: ({ row }) => {
      const entry = row.original;
      return (
        <div>
          <div className="font-medium">
            {getIdTypeDisplayName(entry.frontendIdType)}
          </div>
          {entry.fullName && (
            <div className="text-sm text-gray-600">{entry.fullName}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'idNumber',
    header: 'ID Number',
    cell: ({ row }) => {
      const idNumber = row.getValue('idNumber') as string;
      return (
        <div className="font-mono text-sm">
          {formatIdNumber(idNumber)}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const entry = row.original;
      
      return (
        <div>
          <div className="flex items-center gap-2">
            {getStatusIcon(status)}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
              {status}
            </span>
          </div>
          {entry.resultText && (
            <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
              {entry.resultText}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Submitted',
    cell: ({ row }) => {
      const entry = row.original;
      return (
        <div className="text-sm">
          <div>{formatDate(entry.createdAt)}</div>
          {entry.verificationDate && (
            <div className="text-xs text-gray-500">
              Verified: {formatDate(entry.verificationDate)}
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const entry = row.original;
      
      return (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              // TODO: Implement view details modal
              console.log('View details for:', entry._id);
            }}
            className="flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            View
          </Button>
        </div>
      );
    },
  },
];

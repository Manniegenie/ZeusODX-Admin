import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RefreshCw, Eye, Image, ImageOff } from 'lucide-react';
import type { KYCEntry } from '../types/kyc';

interface KYCDataTableProps {
  data: KYCEntry[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
  onPageChange: () => void;
  onRefresh: () => void;
}

export function KYCDataTable({
  data,
  pagination,
  onPageChange,
  onRefresh
}: KYCDataTableProps) {
  const navigate = useNavigate();
  const { currentPage, totalPages, total, hasNextPage, hasPrevPage, limit } = pagination;

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

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, total)} of {total} entries
        </div>
        <Button
          onClick={onRefresh}
          size="sm"
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
              <TableHead className="font-semibold">User</TableHead>
              <TableHead className="font-semibold">ID Type</TableHead>
              <TableHead className="font-semibold">ID Number</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Submitted</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((entry) => (
              <TableRow key={entry._id} className="hover:bg-gray-50">
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {entry.user.firstname} {entry.user.lastname}
                    </div>
                    <div className="text-sm text-gray-600">{entry.user.email}</div>
                    <div className="text-sm text-gray-500">{entry.user.phonenumber}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {getIdTypeDisplayName(entry.frontendIdType)}
                  </div>
                  {entry.fullName && (
                    <div className="text-sm text-gray-600">{entry.fullName}</div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-mono text-sm">
                    {formatIdNumber(entry.idNumber)}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                    {entry.status}
                  </span>
                  {entry.resultText && (
                    <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                      {entry.resultText}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatDate(entry.createdAt)}
                  </div>
                  {entry.verificationDate && (
                    <div className="text-xs text-gray-500">
                      Verified: {formatDate(entry.verificationDate)}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => navigate(`/kyc/${entry._id}`)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              // TODO: Implement previous page
              console.log('Previous page');
            }}
            disabled={!hasPrevPage}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  size="sm"
                  onClick={() => {
                    // TODO: Implement page navigation
                    console.log('Go to page:', pageNum);
                  }}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            size="sm"
            onClick={onPageChange}
            disabled={!hasNextPage}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>
      </div>
    </div>
  );
}

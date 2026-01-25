import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import type { User } from "../types/user";

interface DataTableProps {
  data: User[];
  loading: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPageChange: (page: number) => void;
}

export function DataTable({ data, loading, pagination, onPageChange }: DataTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getKycBadge = (level: number) => {
    const variants = {
      0: 'bg-gray-100 text-gray-800',
      1: 'bg-blue-100 text-blue-800',
      2: 'bg-green-100 text-green-800'
    };
    return (
      <Badge className={variants[level as keyof typeof variants] || variants[0]}>
        KYC {level}
      </Badge>
    );
  };

  const getStatusBadge = (emailVerified: boolean, bvnVerified: boolean) => {
    if (bvnVerified) {
      return <Badge variant="default" className="bg-green-100 text-green-800">BVN Verified</Badge>;
    }
    if (emailVerified) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Email Verified</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>KYC Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{`${user.firstname} ${user.lastname}`.trim() || 'No Name'}</div>
                    <div className="text-sm text-gray-500 normal-case">{user.email}</div>
                  </div>
                </TableCell>
                <TableCell>{user.phonenumber || '—'}</TableCell>
                <TableCell>{getKycBadge(user.kycLevel)}</TableCell>
                <TableCell>{getStatusBadge(user.emailVerified, user.bvnVerified)}</TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button  size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data.length > 0 && (
        <div className="flex items-center justify-between px-2 py-4">
          <Button
            size="sm"
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <div className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
          <Button
            size="sm"
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
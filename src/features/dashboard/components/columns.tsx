"use client"
import React from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table"
import type { Transaction } from '../type/analytic'

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "id",
    header: "Transaction ID",
    cell: info => {
      const value = info.getValue() as string;
      return value ? (
        <span className="font-mono text-xs">{value}</span>
      ) : '—';
    }
  },
  {
    accessorKey: "username",
    header: "User",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: info => {
      const type = info.getValue() as string;
      const badges: Record<string, string> = {
        'SWAP': 'bg-blue-100 text-blue-800',
        'OBIEX_SWAP': 'bg-blue-100 text-blue-800',
        'DEPOSIT': 'bg-green-100 text-green-800',
        'WITHDRAWAL': 'bg-red-100 text-red-800',
        'GIFTCARD': 'bg-purple-600 text-white',
        'INTERNAL_TRANSFER_SENT': 'bg-orange-100 text-orange-800',
        'INTERNAL_TRANSFER_RECEIVED': 'bg-teal-100 text-teal-800',
        'AIRTIME': 'bg-yellow-100 text-yellow-800',
        'DATA': 'bg-cyan-100 text-cyan-800',
        'ELECTRICITY': 'bg-amber-100 text-amber-800',
        'CABLE_TV': 'bg-indigo-100 text-indigo-800',
        'INTERNET': 'bg-sky-100 text-sky-800',
        'BETTING': 'bg-rose-100 text-rose-800',
        'EDUCATION': 'bg-lime-100 text-lime-800'
      };
      const displayNames: Record<string, string> = {
        'OBIEX_SWAP': 'Provider Swap',
        'SWAP': 'Swap',
        'DEPOSIT': 'Deposit',
        'WITHDRAWAL': 'Withdrawal',
        'GIFTCARD': 'Gift Card',
        'INTERNAL_TRANSFER_SENT': 'Transfer Sent',
        'INTERNAL_TRANSFER_RECEIVED': 'Transfer Received',
        'AIRTIME': 'Airtime',
        'DATA': 'Data',
        'ELECTRICITY': 'Electricity',
        'CABLE_TV': 'Cable TV',
        'INTERNET': 'Internet',
        'BETTING': 'Betting',
        'EDUCATION': 'Education'
      };
      const className = badges[type] || 'bg-gray-100 text-gray-800';
      const displayName = displayNames[type] || type;
      return (
        <span className={`px-2 py-1 rounded text-xs font-medium ${className}`}>
          {displayName}
        </span>
      );
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: info => {
      const status = info.getValue() as string;
      const badges: Record<string, string> = {
        'SUCCESSFUL': 'bg-green-100 text-green-800',
        'COMPLETED': 'bg-green-100 text-green-800',
        'CONFIRMED': 'bg-green-100 text-green-800',
        'PENDING': 'bg-yellow-100 text-yellow-800',
        'PROCESSING': 'bg-blue-100 text-blue-800',
        'FAILED': 'bg-red-100 text-red-800',
        'REJECTED': 'bg-red-100 text-red-800'
      };
      const className = badges[status] || 'bg-gray-100 text-gray-800';
      return (
        <span className={`px-2 py-1 rounded text-xs font-medium ${className}`}>
          {status}
        </span>
      );
    }
  },
  {
    accessorKey: "currency",
    header: "Currency",
    cell: info => {
      const currency = info.getValue() as string;
      return <span className="font-mono font-semibold">{currency}</span>;
    }
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: info => {
      const amount = info.getValue() as number;
      const isNegative = amount < 0;
      return (
        <span className={`font-mono ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
          {isNegative ? '-' : '+'}{Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
        </span>
      );
    }
  },
  {
    accessorKey: "reference",
    header: "Reference",
    cell: info => {
      const value = info.getValue() as string;
      return value ? (
        <span className="font-mono text-sm">{value.substring(0, 12)}...</span>
      ) : '—';
    }
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: info => {
      const date = new Date(info.getValue() as string);
      return (
        <div className="text-sm">
          <div>{date.toLocaleDateString()}</div>
          <div className="text-gray-500 text-xs">{date.toLocaleTimeString()}</div>
        </div>
      );
    }
  },
  {
    id: "details",
    header: "Details",
    cell: ({ row }) => {
      const tx = row.original;
      
      // Show swap details
      if (tx.type === 'SWAP' || tx.type === 'OBIEX_SWAP') {
        return (
          <div className="text-xs space-y-1">
            <div>{tx.fromCurrency} → {tx.toCurrency}</div>
            {tx.swapType && (
              <div className="text-gray-500">{tx.swapType}</div>
            )}
          </div>
        );
      }
      
      // Show withdrawal details
      if (tx.bankName) {
        return (
          <div className="text-xs space-y-1">
            <div>{tx.bankName}</div>
            <div className="text-gray-500">{tx.accountNumberMasked}</div>
          </div>
        );
      }
      
      // Show transfer details
      if (tx.recipientUsername || tx.senderUsername) {
        return (
          <div className="text-xs">
            {tx.recipientUsername ? `To: ${tx.recipientUsername}` : `From: ${tx.senderUsername}`}
          </div>
        );
      }
      
      // Show giftcard details
      if (tx.cardType) {
        return (
          <div className="text-xs space-y-1">
            <div>{tx.cardType}</div>
            {tx.country && <div className="text-gray-500">{tx.country}</div>}
          </div>
        );
      }
      
      return <span className="text-gray-400">—</span>;
    }
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const [open, setOpen] = React.useState(false);
      const navigate = useNavigate();
      const tx = row.original;
      
      return (
        <div className="relative">
          <button
            className="p-2 rounded hover:bg-gray-100"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="More actions"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="5" r="1.5"/>
              <circle cx="12" cy="12" r="1.5"/>
              <circle cx="12" cy="19" r="1.5"/>
            </svg>
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-10">
              <button
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => {
                  setOpen(false);
                  navigator.clipboard.writeText(tx.id);
                }}
              >
                Copy Transaction ID
              </button>
              {tx.reference && (
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => {
                    setOpen(false);
                    navigator.clipboard.writeText(tx.reference!);
                  }}
                >
                  Copy Reference
                </button>
              )}
              <button
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => {
                  setOpen(false);
                  navigate(`/transaction/${tx.id}`);
                }}
              >
                View Full Details
              </button>
              {tx.userId && (
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => {
                    setOpen(false);
                    navigate(`/users?search=${tx.userEmail || tx.username || tx.userId}`);
                  }}
                >
                  View User
                </button>
              )}
            </div>
          )}
        </div>
      );
    },
  },
]
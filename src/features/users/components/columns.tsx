"use client"
import type { ColumnDef } from "@tanstack/react-table"
import type { User } from "../types/user"
import { ActionsMenu } from "./ActionsMenu";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "_id",
    header: "User ID",
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: info => <span className="normal-case">{info.getValue() as string}</span>,
  },
  {
    accessorKey: "phonenumber",
    header: "Phone",
  },
  {
    accessorKey: "kycLevel",
    header: "KYC Level",
  },
  {
    accessorKey: "kycStatus",
    header: "KYC Status",
  },
  {
    accessorKey: "emailVerified",
    header: "Email Verified",
    cell: info => (info.getValue() ? 'Yes' : 'No'),
  },
  {
    accessorKey: "bvnVerified",
    header: "BVN Verified",
    cell: info => (info.getValue() ? 'Yes' : 'No'),
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: info => new Date(info.getValue() as string).toLocaleString(),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <ActionsMenu row={row} />,
  },
]
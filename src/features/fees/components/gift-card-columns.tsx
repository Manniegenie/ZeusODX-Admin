"use client"
import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { GiftCardRate } from "../type/giftCardRate.types";
import { Button } from "@/components/ui/button";
import { Edit2, MoreHorizontal, Trash2Icon } from "lucide-react";
import { toast } from 'sonner'
import { updateGiftCardRateAPI } from '../services/giftCardRateService'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

// Edit Dialog Component
function EditRateDialog({
  rate,
  open,
  onOpenChange,
}: {
  rate: GiftCardRate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    rate: rate.rate || 0,
    physicalRate: rate.physicalRate || 0,
    ecodeRate: rate.ecodeRate || 0,
    minAmount: rate.minAmount || 0,
    maxAmount: rate.maxAmount || 0,
    notes: rate.notes || '',
    isActive: rate.isActive ?? true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value,
    }));
  };

  const handleCheckbox = (checked: boolean) => {
    setForm((prev) => ({ ...prev, isActive: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const body: {
        rate?: number;
        physicalRate?: number;
        ecodeRate?: number;
        minAmount?: number;
        maxAmount?: number;
        notes?: string;
        isActive?: boolean;
      } = {};

      if (form.rate !== rate.rate) body.rate = form.rate;
      if (form.physicalRate !== rate.physicalRate) body.physicalRate = form.physicalRate;
      if (form.ecodeRate !== rate.ecodeRate) body.ecodeRate = form.ecodeRate;
      if (form.minAmount !== rate.minAmount) body.minAmount = form.minAmount;
      if (form.maxAmount !== rate.maxAmount) body.maxAmount = form.maxAmount;
      if (form.notes !== rate.notes) body.notes = form.notes;
      if (form.isActive !== rate.isActive) body.isActive = form.isActive;

      const res = await updateGiftCardRateAPI(rate.id, body);
      toast.success(res?.message || 'Rate updated successfully');
      window.dispatchEvent(new CustomEvent('giftcard:updated', { detail: { id: rate.id } }));
      onOpenChange(false);
    } catch (err) {
      console.error('Update failed', err);
      toast.error('Failed to update rate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      rate: rate.rate || 0,
      physicalRate: rate.physicalRate || 0,
      ecodeRate: rate.ecodeRate || 0,
      minAmount: rate.minAmount || 0,
      maxAmount: rate.maxAmount || 0,
      notes: rate.notes || '',
      isActive: rate.isActive ?? true,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && isLoading) return;
      if (!isOpen) handleCancel();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="w-full min-w-2xl bg-white border border-gray-300 p-0 text-black/90">
        <DialogHeader className="border-b border-gray-200 px-4 py-4">
          <DialogTitle>Edit Gift Card Rate</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6 pt-2">
          {/* Read-only info */}
          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="block text-sm font-normal text-[#737373] mb-1">Card Type</label>
              <div className="w-full border border-gray-200 bg-gray-50 rounded px-3 py-2 text-black">
                {rate.cardType}
              </div>
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-normal text-[#737373] mb-1">Country</label>
              <div className="w-full border border-gray-200 bg-gray-50 rounded px-3 py-2 text-black">
                {rate.country}
              </div>
            </div>
          </div>

          {/* Editable fields */}
          <div>
            <label className="block text-sm font-normal text-[#737373] mb-1">Base rate (₦ per base currency)</label>
            <input
              type="number"
              name="rate"
              value={form.rate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-black bg-white"
              min={0}
              disabled={isLoading}
              aria-label="Base rate"
            />
          </div>

          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="block text-sm font-normal text-[#737373] mb-1">Physical rate</label>
              <input
                type="number"
                name="physicalRate"
                value={form.physicalRate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black bg-white"
                min={0}
                disabled={isLoading}
                aria-label="Physical rate"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-normal text-[#737373] mb-1">E-code rate</label>
              <input
                type="number"
                name="ecodeRate"
                value={form.ecodeRate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black bg-white"
                min={0}
                disabled={isLoading}
                aria-label="E-code rate"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="block text-sm font-normal text-[#737373] mb-1">Min amount</label>
              <input
                type="number"
                name="minAmount"
                value={form.minAmount}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black bg-white"
                min={0}
                disabled={isLoading}
                aria-label="Minimum amount"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-normal text-[#737373] mb-1">Max amount</label>
              <input
                type="number"
                name="maxAmount"
                value={form.maxAmount}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black bg-white"
                min={0}
                disabled={isLoading}
                aria-label="Maximum amount"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-normal text-[#737373] mb-1">Notes</label>
            <Textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-black bg-white"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={form.isActive}
              onCheckedChange={handleCheckbox}
              id="editIsActive"
              className="border-gray-400"
              disabled={isLoading}
            />
            <label htmlFor="editIsActive" className="text-sm text-black">Active</label>
          </div>

          <DialogFooter className="flex justify-center items-center gap-2 pt-2">
            <Button
              className="w-1/2 h-12 text-primary border border-green-700 font-normal bg-white hover:bg-gray-50"
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className="w-1/2 h-12 text-white font-normal"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Actions Cell Component with Edit Dialog
function ActionsCell({ row }: { row: { original: GiftCardRate } }) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="h-8 w-8 p-0 bg-[#35297F] hover:bg-[#35297F] text-white">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white text-black/90 border border-gray-200 shadow-none">
          <DropdownMenuItem
            onClick={() => setEditOpen(true)}
          >
            <Edit2 className="h-3 w-3 mr-2" />Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              const id = row.original.id as string;
              window.dispatchEvent(new CustomEvent('giftcard:delete-request', { detail: { id } }));
            }}
            className="text-red-500 hover:bg-red-100"
          >
            <Trash2Icon className="h-3 w-3 mr-2" />Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditRateDialog
        rate={row.original}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}

export const giftCardColumns: ColumnDef<GiftCardRate>[] = [
  { accessorKey: "cardType", header: "Card type", cell: ({ row }) => <span style={{ color: '#1A1A1A' }}>{row.getValue("cardType")}</span> },
  { accessorKey: "country", header: "Country", cell: ({ row }) => <span style={{ color: '#1A1A1A' }}>{row.getValue("country")}</span> },
  { accessorKey: "rateDisplay", header: "Base rate", cell: ({ row }) => <span style={{ color: '#1A1A1A' }}>{row.getValue("rateDisplay")}</span> },
  { accessorKey: "physicalRate", header: "Physical", cell: ({ row }) => <span style={{ color: '#1A1A1A' }}>{row.getValue("physicalRate")}</span> },
  { accessorKey: "ecodeRate", header: "E-code", cell: ({ row }) => <span style={{ color: '#1A1A1A' }}>{row.getValue("ecodeRate")}</span> },
  { accessorKey: "minAmount", header: "Min amount", cell: ({ row }) => <span style={{ color: '#1A1A1A' }}>{row.getValue("minAmount")}</span> },
  { accessorKey: "maxAmount", header: "Max amount", cell: ({ row }) => <span style={{ color: '#1A1A1A' }}>{row.getValue("maxAmount")}</span> },
  { accessorKey: "lastUpdated", header: "Last updated", cell: ({ row }) => <span style={{ color: '#1A1A1A' }}>{row.getValue("lastUpdated")}</span> },
  { accessorKey: "updatedBy", header: "Updated by", cell: ({ row }) => <span style={{ color: '#1A1A1A' }}>{row.getValue("updatedBy")}</span> },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive");
      return (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isActive ? 'Active' : 'Inactive'}
        </div>
      );
    }
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <ActionsCell row={row} />
  }
]

"use client"

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { File, Filter, HelpCircle, Plus, Search, UploadCloud } from "lucide-react"
import { useGiftCardForm } from "../hooks/useGiftCardForm"
import { Button } from "@/components/ui/button"
import React, { useState, useEffect, useRef } from "react"
import type { GiftCardRate } from "../type/giftCardRate.types"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { fetchGiftCardRatesAPI } from "../services/giftCardRateService"
import { toast } from "sonner"
import type { AxiosProgressEvent } from 'axios'


const CARD_TYPES = [
  "APPLE",
  "STEAM",
  "NORDSTROM",
  "MACY",
  "NIKE",
  "GOOGLE_PLAY",
  "AMAZON",
  "VISA",
  "VANILLA",
  "RAZOR_GOLD",
  "AMERICAN_EXPRESS",
  "SEPHORA",
  "FOOTLOCKER",
  "XBOX",
  "EBAY"
]
const COUNTRIES = ["US", "CANADA", "AUSTRALIA", "SWITZERLAND"]

interface Pagination {
  currentPage: number
  totalPages: number
  totalRates: number
  limit: number
}

interface GiftDataTableProps {
  columns: ColumnDef<GiftCardRate, unknown>[]
  data: GiftCardRate[]
  pagination?: Pagination | null
  onPageChange?: (page: number) => void
  onRatesUpdate?: (rates: GiftCardRate[]) => void
}

export const GiftDataTable: React.FC<GiftDataTableProps> = ({
  columns,
  data,
  pagination,
  onPageChange,
  onRatesUpdate,
}) => {
  // filters
  const [filterCardType, setFilterCardType] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [displayedData, setDisplayedData] = useState<GiftCardRate[]>(data ?? [])

  // debounce ref for search
  const searchTimer = useRef<number | null>(null)

  // Update displayedData when props 'data' changes
  useEffect(() => {
    setDisplayedData(data ?? [])
  }, [data])

  // Apply filters (cardType + search) client-side, debounced for search
  useEffect(() => {
    if (searchTimer.current) {
      window.clearTimeout(searchTimer.current)
      searchTimer.current = null
    }

    // debounce search by 350ms
    searchTimer.current = window.setTimeout(() => {
      const s = searchTerm.trim().toLowerCase()
      const filtered = (data ?? []).filter((r) => {
        const matchCard = filterCardType ? r.cardType === filterCardType : true
        if (!s) return matchCard
        const inCard = r.cardType?.toLowerCase().includes(s)
        const inCountry = r.country?.toLowerCase().includes(s)
        const inRateDisplay = r.rateDisplay?.toLowerCase().includes(s)
        return matchCard && (inCard || inCountry || inRateDisplay)
      })
      setDisplayedData(filtered)
    }, 350)

    return () => {
      if (searchTimer.current) {
        window.clearTimeout(searchTimer.current)
        searchTimer.current = null
      }
    }
  }, [searchTerm, filterCardType, data])

  const table = useReactTable({
    data: displayedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Dialog state
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [rateToDelete, setRateToDelete] = useState<string | null>(null)
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  // filename not currently used in the UI
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Callback to refresh data after successful submission
  const handleRatesUpdate = async () => {
    try {
      const response = await fetchGiftCardRatesAPI()
      if (response?.data?.rates) {
        onRatesUpdate?.(response.data.rates)
      }
    } catch (err: unknown) {
      console.error('Failed to refresh rates:', err)
      toast.error('Failed to refresh rates')
    }
  }

  // Called by the form hook after a successful API create
  const onSuccess = async () => {
    try {
      await handleRatesUpdate();
      // close the dialog after successful creation
      setOpen(false);
    } catch (err) {
      // refresh failed - just log, toast already handled in handler
      console.error('onSuccess refresh failed', err);
    }
  }

  // Form state and handlers from custom hook
  const { 
    form, 
    isLoading: giftLoading, 
    handleChange, 
    handleCheckbox,
    handleSubmit,
    resetForm 
  } = useGiftCardForm(onSuccess)

  // Handle cancel action
  const handleCancel = () => {
    resetForm();
    setOpen(false);
  }

  // Simple confirm handler placeholder (delete action should be implemented)
  const handleConfirmSubmit = async () => {
    // perform delete if an id is set
    if (!rateToDelete) {
      setConfirmOpen(false);
      return;
    }
    try {
      setBulkLoading(true);
      const res = await (await import('../services/giftCardRateService')).deleteGiftCardRateAPI(rateToDelete)
      toast.success(res?.message || 'Rate deleted')
      window.dispatchEvent(new CustomEvent('giftcard:deleted', { detail: { id: rateToDelete } }))
      // refresh data
      await handleRatesUpdate()
    } catch (err) {
      console.error('Delete failed', err)
      toast.error('Failed to delete rate')
    } finally {
      setBulkLoading(false);
      setRateToDelete(null);
      setConfirmOpen(false);
    }
  }

  // Listen for delete requests coming from row actions
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ id: string }>
      const id = custom?.detail?.id
      if (!id) return
      setRateToDelete(id)
      setConfirmOpen(true)
    }
    window.addEventListener('giftcard:delete-request', handler as EventListener)
    return () => window.removeEventListener('giftcard:delete-request', handler as EventListener)
  }, [])

  // CSV export helper
  const escapeCsv = (value: unknown) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // Escape double quotes by doubling them, and wrap field in quotes if it contains comma or quotes or newline
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  const handleExportCsv = () => {
    try {
      if (!data || data.length === 0) {
        toast.error('No data to export');
        return;
      }

      // Columns to export - adjust order/fields as needed
      const headers = ['id', 'cardType', 'country', 'rate', 'rateDisplay', 'isActive', 'createdAt'];

      const rows = data.map((row) => (
        headers.map((h) => escapeCsv((row as Record<keyof GiftCardRate, unknown>)[h as keyof GiftCardRate])).join(',')
      ));

      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = `giftcard_rates_${new Date().toISOString().slice(0,10)}.csv`;
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Export started');
    } catch (err) {
      console.error('Export CSV failed', err);
      toast.error('Failed to export CSV');
    }
  }

  // progress handled via Tailwind arbitrary width class (w-[<n>%]) below

  // Bulk upload handler
  const handleFileSelect = (f?: File) => {
    setSelectedFile(f || null);
  }

  interface BulkDetail {
    err?: { errmsg?: string; message?: string; op?: unknown }
    index?: number
  }

  interface BulkResponse {
    success: boolean
    message?: string
    details?: BulkDetail[]
  }

  const handleBulkUpload = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setBulkLoading(true);
    setUploadProgress(0);

    // Read file as text, attempt to parse JSON. For CSV support, we could parse here.
    try {
      const text = await selectedFile.text();
  let ratesPayload: Record<string, unknown>[] = [];

      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) ratesPayload = parsed;
        else if (parsed?.rates && Array.isArray(parsed.rates)) ratesPayload = parsed.rates;
        else throw new Error('JSON must be an array or { rates: [...] }');
      } catch (jsonErr) {
        console.debug('JSON parse error', jsonErr);
        throw new Error('Failed to parse file as JSON. Provide a JSON array or object with "rates" array.');
      }

      // Use axios-based upload with progress handler
      const { bulkCreateGiftCardRatesWithProgress } = await import('../services/giftCardRateService');
      const result = (await bulkCreateGiftCardRatesWithProgress({ rates: ratesPayload }, (progressEvent?: AxiosProgressEvent) => {
        if (!progressEvent) return;
        const loaded = typeof progressEvent.loaded === 'number' ? progressEvent.loaded : 0;
        const total = typeof progressEvent.total === 'number' ? progressEvent.total : 0;
        const percent = total ? Math.round((loaded * 100) / total) : 0;
        setUploadProgress(percent);
      })) as BulkResponse | undefined;

      // The server may respond with success: false and include validation details
      if (result && result.success === false) {
        const details = Array.isArray(result.details) ? result.details : [];
        const detailSummary = details.length
          ? details
              .slice(0, 3)
              .map((d, i) => {
                const errmsg = d?.err?.errmsg || d?.err?.message || JSON.stringify(d?.err?.op || d);
                return `${i + 1}. ${errmsg}`;
              })
              .join(' | ')
          : '';

        const errMsg = result.message ? `${result.message}${detailSummary ? `: ${detailSummary}` : ''}` : 'Bulk upload failed';
        toast.error(errMsg);
        console.info('Bulk upload response details:', result.details || details);
        return;
      }

      toast.success((result as BulkResponse | undefined)?.message || 'Bulk rates uploaded successfully');
      setBulkOpen(false);
  setSelectedFile(null);
      setUploadProgress(100);
      // refresh table data
      await handleRatesUpdate();
    } catch (err: unknown) {
      // Prefer server-provided message/details when available (axios error shape)
      let message = err instanceof Error ? err.message : 'Bulk upload failed';
      if (typeof err === 'object' && err !== null) {
        const anyErr = err as { response?: { data?: BulkResponse | { message?: string; error?: string; details?: BulkDetail[] } } };
        const serverData = anyErr.response?.data;
        if (serverData) {
          const sd = serverData as BulkResponse | { message?: string; error?: string; details?: BulkDetail[] };
          if (sd.message) {
            const details = Array.isArray(sd.details) ? sd.details : [];
            if (details.length > 0) {
              const detailSummary = details
                .slice(0, 3)
                .map((d) => d?.err?.errmsg || d?.err?.message || JSON.stringify(d?.err?.op || d))
                .join(' | ');
              message = `${sd.message}${detailSummary ? `: ${detailSummary}` : ''}`;
            } else {
              message = sd.message;
            }
          } else if ((sd as { error?: string }).error) {
            message = (sd as { error?: string }).error as string;
          }
        }
      }

      toast.error(message);
    } finally {
      setBulkLoading(false);
      // small delay to allow progress show 100%
      setTimeout(() => setUploadProgress(0), 500);
    }
  };

  return (
    <div className="w-full overflow-hidden">
      <div className="w-full flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Select value={filterCardType} onValueChange={(v) => setFilterCardType(v === '__ALL__' ? '' : v)}>
            <SelectTrigger className="w-[180px] border border-gray-300 bg-white">
              <SelectValue placeholder="All card type" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-none">
              <SelectGroup>
                <SelectLabel>Card types</SelectLabel>
                <SelectItem value="__ALL__">All</SelectItem>
                {CARD_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="text-gray-400 w-4 h-4" />
            </span>
            <Input
              className="pl-10 w-[220px] border border-gray-300 bg-white"
              placeholder="Search"
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button >
            <Filter className="text-gray-500 h-4 w-4" />
          </Button>
          <Button className="text-xs text-white font-normal" onClick={() => setOpen(true)}>
            <Plus className="w-3 h-3" /> Add rate
          </Button>
          <Button className="text-xs text-white font-normal" onClick={() => setBulkOpen(true)}>
            <UploadCloud className="w-3 h-3" /> Bulk upload
          </Button>
          <Button className="text-xs text-white font-normal" onClick={handleExportCsv}>
            <File className="w-3 h-3" /> Export CSV
          </Button>
        </div>
      </div>
      <div className="w-full overflow-auto rounded-md shadow-sm">
        <Table className="w-full border border-gray-200">
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-gray-200">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className="border-b border-gray-200 last:border-0"
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && (
        <div className="w-full flex items-center justify-between mt-4">
          <Button
            disabled={pagination.currentPage === 1}
            onClick={() => onPageChange?.(pagination.currentPage - 1)}
            className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50 font-normal"
          >
            Prev
          </Button>
          <div className="flex gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => onPageChange?.(page)}
                className={`px-2 py-1 rounded font-normal text-xs border border-gray-200 ${page === pagination.currentPage ? "bg-primary text-white" : "bg-gray-100"
                  }`}
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => onPageChange?.(pagination.currentPage + 1)}
            className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50 font-normal"
          >
            Next
          </Button>
        </div>
      )}

      {/* Add Rate Dialog */}
      <Dialog 
        open={open} 
        onOpenChange={(isOpen) => {
          // Prevent closing during form submission
          if (!isOpen && giftLoading) {
            return;
          }
          if (!isOpen) {
            resetForm();
          }
          setOpen(isOpen);
        }}
      >
        <DialogContent className="w-full min-w-2xl bg-white border border-gray-300 p-0 text-black/90">
          <DialogHeader className="border-b border-gray-200 px-4 py-4">
            <DialogTitle className="">Add Gift Card Rate</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6 pt-2">
            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="block text-sm font-normal text-[#737373] mb-1">Card Type</label>
                <select
                  name="cardType"
                  value={form.cardType}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black bg-white"
                  disabled={giftLoading}
                  aria-label="Card Type"
                  title="Select a card type"
                >
                  <option value="">Select Card Type</option>
                  {CARD_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-normal text-[#737373] mb-1">Country</label>
                <select
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black bg-white"
                  disabled={giftLoading}
                  aria-label="Country"
                  title="Select a country"
                >
                  <option value="">Select Country</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-normal text-[#737373] mb-1">Base rate (₦ per base currency)</label>
              <input
                type="number"
                name="rate"
                value={form.rate}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-black bg-white"
                min={0}
                disabled={giftLoading}
                aria-label="Base rate"
                title="Enter base rate in naira per base currency"
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
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black bg-white"
                  min={0}
                  disabled={giftLoading}
                  aria-label="Physical rate"
                  title="Enter physical card rate"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-normal text-[#737373] mb-1">E-code rate</label>
                <input
                  type="number"
                  name="ecodeRate"
                  value={form.ecodeRate}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black bg-white"
                  min={0}
                  disabled={giftLoading}
                  aria-label="E-code rate"
                  title="Enter e-code rate"
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
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black bg-white"
                  min={0}
                  disabled={giftLoading}
                  aria-label="Minimum amount"
                  title="Enter minimum amount allowed"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-normal mb-1 text-[#737373]">Max amount</label>
                <input
                  type="number"
                  name="maxAmount"
                  value={form.maxAmount}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black bg-white"
                  min={0}
                  disabled={giftLoading}
                  aria-label="Maximum amount"
                  title="Enter maximum amount allowed"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-normal mb-1 text-[#737373]">Notes</label>
              <Textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black bg-white"
                rows={3}
                disabled={giftLoading}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.isActive}
                onCheckedChange={handleCheckbox}
                id="isActive"
                className="border-gray-400"
                disabled={giftLoading}
              />
              <label htmlFor="isActive" className="text-sm">Active</label>
            </div>
            <DialogFooter className="flex justify-center items-center gap-2 pt-2">
              <Button 
                className="w-1/2 h-12 text-primary border border-green-700 font-normal" 
                type="button" 
                onClick={handleCancel}
                disabled={giftLoading}
              >
                Cancel
              </Button>
              <Button className="w-1/2 h-12 text-white font-normal" type="submit" disabled={giftLoading}>
                {giftLoading ? "Saving..." : "Save rate"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="w-full max-w-lg bg-white border border-gray-300 p-0 text-black/90">
          <DialogHeader className="border-b border-gray-200 px-4 py-4">
            <DialogTitle>Bulk Create Gift Card Rates</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBulkUpload} className="space-y-4 px-6 pb-6 pt-2">
            <div>
              <label className="block text-sm font-normal text-[#737373] mb-1">Paste JSON array of rates</label>
              {/* File upload replaced the old textarea input */}
            </div>
            <DialogFooter className="flex justify-center items-center gap-2 pt-2">
              <Button 
                className="w-1/2 h-12 text-primary border border-green-700 font-normal" 
                type="button" 
                onClick={() => setBulkOpen(false)}
                disabled={bulkLoading}
              >
                Cancel
              </Button>
              <Button className="w-1/2 h-12 text-white font-normal" type="submit" disabled={bulkLoading}>
                {bulkLoading ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
        {/* Bulk Upload Dialog */}
        <Dialog open={bulkOpen} onOpenChange={(v) => { if (!v) { setSelectedFile(null); setUploadProgress(0); } setBulkOpen(v); }}>
          <DialogContent className="w-full max-w-lg bg-white border border-gray-300 p-0 text-black/90">
            <DialogHeader className="border-b border-gray-200 px-4 py-4">
              <DialogTitle>Bulk Create Gift Card Rates</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleBulkUpload} className="space-y-4 px-6 pb-6 pt-2">
              <div>
                <label className="block text-sm font-normal text-[#737373] mb-1">Upload JSON file</label>
                <Input
                  type="file"
                  accept="application/json"
                  title="Select a JSON file containing rates"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    handleFileSelect(f || undefined);
                  }}
                  className="w-full border border-gray-300 text-gray-300 rounded px-3 pb-5"
                  disabled={bulkLoading}
                />
              </div>

                      {uploadProgress > 0 && (
                        <div className="w-full">
                          <div className="h-2">
                            <progress value={uploadProgress} max={100} className="w-full h-2 appearance-none rounded" />
                          </div>
                          <div className="text-xs text-right mt-1">{uploadProgress}%</div>
                        </div>
                      )}

              <DialogFooter className="flex justify-center items-center gap-2 pt-2">
                <Button 
                  className="w-1/2 h-12 text-primary border border-green-700 font-normal" 
                  type="button" 
                  onClick={() => setBulkOpen(false)}
                  disabled={bulkLoading}
                >
                  Cancel
                </Button>
                <Button className="w-1/2 h-12 text-white font-normal" type="submit" disabled={bulkLoading || !selectedFile}>
                  {bulkLoading ? "Uploading..." : "Upload file"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      {/* Confirmation Dialog - This seems to be for delete confirmation, not form submission */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="w-[380px] max-w-sm bg-white border border-gray-300 p-4 text-black/90">
          <DialogHeader className="flex flex-col items-center gap-2">
            <HelpCircle size={60} className="text-gray-500" />
            <DialogTitle>Confirm action</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">Are you sure you want to delete this rate. This action cannot be undone.</div>
          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button  className="w-1/2 bg-white border ring-none border-red-500 text-red-500" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSubmit} className="w-1/2 text-white bg-red-500"  disabled={giftLoading}>
              {giftLoading ? "Deleting..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
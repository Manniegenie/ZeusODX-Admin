import { CalendarDays, RefreshCw, X } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';

interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onApply: () => void;
  onClear?: () => void;
  loading?: boolean;
  className?: string;
}

export function DateRangeFilter({
  dateFrom,
  dateTo,
  onFromChange,
  onToChange,
  onApply,
  onClear,
  loading = false,
  className = '',
}: DateRangeFilterProps) {
  const hasFilter = !!(dateFrom || dateTo);

  const handleClear = () => {
    onFromChange('');
    onToChange('');
    onClear?.();
  };

  return (
    <div className={`flex flex-wrap items-end gap-2 ${className}`}>
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-gray-500">From</Label>
        <Input
          type="date"
          value={dateFrom}
          onChange={e => onFromChange(e.target.value)}
          className="h-8 text-sm w-36"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-gray-500">To</Label>
        <Input
          type="date"
          value={dateTo}
          onChange={e => onToChange(e.target.value)}
          className="h-8 text-sm w-36"
        />
      </div>
      <Button
        onClick={onApply}
        disabled={loading}
        variant="outline"
        className="h-8 gap-1.5 text-sm"
      >
        {loading
          ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          : <CalendarDays className="h-3.5 w-3.5" />}
        Apply
      </Button>
      {hasFilter && (
        <Button
          onClick={handleClear}
          variant="ghost"
          className="h-8 gap-1 text-xs text-gray-500"
        >
          <X className="h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}

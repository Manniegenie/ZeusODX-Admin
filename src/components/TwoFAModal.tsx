import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck } from 'lucide-react';

interface TwoFAModalProps {
  open: boolean;
  title?: string;
  description?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (code: string) => void;
}

export function TwoFAModal({ open, title = 'Confirm with 2FA', description, loading, onClose, onConfirm }: TwoFAModalProps) {
  const [code, setCode] = useState('');

  const handleConfirm = () => {
    if (code.length !== 6 || !/^\d{6}$/.test(code)) return;
    onConfirm(code);
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) { setCode(''); onClose(); }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border border-border shadow-lg max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <ShieldCheck className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          <p className="text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app to proceed.</p>
          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            className="text-center tracking-widest text-lg h-12"
            autoFocus
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={code.length !== 6 || loading}>
            {loading ? 'Verifying...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

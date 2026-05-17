import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export interface SuccessDetail {
  label: string;
  value: string;
  highlight?: boolean; // renders value in larger green text
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  details?: SuccessDetail[];
  redirectTo?: string;
  autoRedirectDelay?: number;
  showRedirectButton?: boolean;
  redirectButtonText?: string;
}

export function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  details,
  redirectTo,
  autoRedirectDelay,
  showRedirectButton = true,
  redirectButtonText = 'Go Back',
}: SuccessModalProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && redirectTo && autoRedirectDelay) {
      const timer = setTimeout(() => {
        navigate(redirectTo);
        onClose();
      }, autoRedirectDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, redirectTo, autoRedirectDelay, navigate, onClose]);

  const handleRedirect = () => {
    if (redirectTo) navigate(redirectTo);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md !bg-white !text-black p-0 overflow-hidden">
        {/* Green header band */}
        <div className="bg-[#00C851] px-6 pt-8 pb-6 flex flex-col items-center gap-3">
          <div className="rounded-full bg-white/20 p-3">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-white text-xl font-bold text-center">{title}</h2>
          <p className="text-white/90 text-sm text-center">{message}</p>
        </div>

        {/* Detail rows */}
        {details && details.length > 0 && (
          <div className="px-6 py-4 space-y-3">
            {details.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{d.label}</span>
                <span
                  className={
                    d.highlight
                      ? 'text-lg font-bold text-[#00C851]'
                      : 'text-sm font-medium text-gray-800 font-mono text-right max-w-[55%] truncate'
                  }
                >
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Countdown */}
        {autoRedirectDelay && redirectTo && (
          <p className="text-center text-xs text-gray-400 pb-2">
            Redirecting in {Math.ceil(autoRedirectDelay / 1000)} seconds...
          </p>
        )}

        <DialogFooter className="px-6 pb-6 sm:justify-center gap-2">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Close
          </Button>
          {showRedirectButton && redirectTo && (
            <Button
              onClick={handleRedirect}
              className="flex-1 bg-[#00C851] hover:bg-[#00a843] text-white"
            >
              {redirectButtonText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

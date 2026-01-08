import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  redirectTo?: string;
  autoRedirectDelay?: number; // milliseconds
  showRedirectButton?: boolean;
  redirectButtonText?: string;
}

export function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
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
    if (redirectTo) {
      navigate(redirectTo);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">{title}</DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {message}
          </DialogDescription>
        </DialogHeader>

        {autoRedirectDelay && redirectTo && (
          <div className="text-center text-sm text-gray-500">
            Redirecting in {Math.ceil(autoRedirectDelay / 1000)} seconds...
          </div>
        )}

        <DialogFooter className="sm:justify-center">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
          {showRedirectButton && redirectTo && (
            <Button onClick={handleRedirect} className="bg-green-600 hover:bg-green-700">
              {redirectButtonText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

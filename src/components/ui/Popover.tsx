import React, { useState, useRef } from 'react';

interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  position?: 'right' | 'left' | 'top' | 'bottom';
  className?: string;
}

export const Popover: React.FC<PopoverProps> = ({ trigger, content, position = 'right', className }) => {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  let popoverPosition = '';
  switch (position) {
    case 'right':
      popoverPosition = 'left-full top-0 ml-2';
      break;
    case 'left':
      popoverPosition = 'right-full top-0 mr-2';
      break;
    case 'top':
      popoverPosition = 'bottom-full mb-2';
      break;
    case 'bottom':
      popoverPosition = 'top-full mt-2';
      break;
    default:
      popoverPosition = 'left-full top-0 ml-2';
  }

  // Close popover when clicking outside
  React.useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className={`relative inline-block ${className || ''}`} ref={popoverRef}>
      <div onClick={() => setOpen((prev) => !prev)} style={{ cursor: 'pointer' }}>
        {trigger}
      </div>
      {open && (
        <div
          className={`absolute ${popoverPosition} min-w-[200px] bg-card text-foreground rounded-lg shadow-lg border border-border z-50 transition-opacity duration-200`}
        >
          {content}
        </div>
      )}
    </div>
  );
};

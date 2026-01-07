"use client"
import React from "react";
import type { Row } from "@tanstack/react-table";
import type { User } from "../types/user";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/core/store/store';
import { removeUser, fetchUsers } from '../store/usersSlice';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

export function ActionsMenu({ row }: { row: Row<User> }) {
  const [open, setOpen] = React.useState(false);
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const [pos, setPos] = React.useState<{ left: number; top: number } | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const navigate = useNavigate();

  const onConfirmDelete = async () => {
    await dispatch(removeUser(row.original.email));
    await dispatch(fetchUsers());
    setConfirmOpen(false);
  };

  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!btnRef.current) return;
      const target = e.target as Node;
      if (btnRef.current.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [open]);

  const toggle = () => {
    if (!btnRef.current) {
      setOpen((v) => !v);
      return;
    }
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ left: rect.right - 176, top: rect.bottom + window.scrollY + 6 });
    setOpen((v) => !v);
  };

  return (
    <div>
      <Button
        ref={btnRef}
        className="p-2 rounded hover:bg-gray-100"
        onClick={toggle}
        aria-label="More actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      {open && pos && createPortal(
        <div style={{ position: 'absolute', left: pos.left, top: pos.top }} className="z-60">
          <div className="w-48 bg-white text-black/90 border border-gray-200 rounded shadow-lg">
            <Button
              onClick={() => {
                setOpen(false);
                navigate('/user-management/actions', { state: { user: row.original } });
              }}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 font-normal rounded-none"
            >
              Manage User
            </Button>
            <Button
              onClick={() => {
                setOpen(false);
                navigate('/user-management/summary', { state: { user: row.original } });
              }}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 font-normal rounded-none"
            >
              View Summary
            </Button>
            <div className="border-t border-gray-200 my-1" />
            <Button
              onClick={() => {
                setOpen(false);
                setConfirmOpen(true);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-normal rounded-none"
            >
              Delete User
            </Button>
          </div>
        </div>,
        document.body
      )}

      <Dialog open={confirmOpen} onOpenChange={(v) => setConfirmOpen(v)}>
        <DialogContent className="text-black/90 bg-white border border-gray-200 shadow-lg max-w-sm w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete user</DialogTitle>
          </DialogHeader>
          <div className="text-sm">Are you sure you want to delete <strong>{row.original.email}</strong>?</div>
          <DialogFooter>
            <Button className="border border-gray-300 text-gray-700 hover:bg-gray-100" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button className="ml-2 text-white bg-red-500 hover:bg-red-600" onClick={onConfirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

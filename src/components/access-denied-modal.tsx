"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface DeniedItem {
  label: string;
  href: string;
}

export function AccessDeniedModal() {
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<DeniedItem | null>(null);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setItem(e.detail);
      setOpen(true);
    };
    window.addEventListener(
      "open-access-denied",
      handler as EventListener
    );
    return () =>
      window.removeEventListener(
        "open-access-denied",
        handler as EventListener
      );
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <DialogTitle className="text-center">Access Required</DialogTitle>
          <DialogDescription className="text-center">
            {item ? (
              <>
                <strong>{item.label}</strong> is not yet enabled for your
                account. Contact your counselor to request access.
              </>
            ) : (
              "This feature is not enabled for your account."
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex sm:justify-center gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Go Back
          </Button>
          <Button
            onClick={() => {
              setOpen(false);
            }}
          >
            Request Access from Counselor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

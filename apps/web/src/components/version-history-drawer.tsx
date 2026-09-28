"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@cogniform/ui";
import { Clock, History, User } from "lucide-react";

interface VersionHistoryDrawerProps {
  formId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VersionHistoryDrawer({ formId, open, onOpenChange }: VersionHistoryDrawerProps) {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    async function loadVersions() {
      setLoading(true);
      try {
        const data = await api.get<any[]>(`/forms/${formId}/versions`);
        setVersions(data);
      } catch (err) {
        console.error("Failed to load version history:", err);
      } finally {
        setLoading(false);
      }
    }
    loadVersions();
  }, [formId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-400" />
            Published Version History
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Immutable snapshots captured each time this form is published online.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center text-slate-400">Loading published snapshots...</div>
          ) : versions.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              No version snapshots captured yet. Publish the form to create a snapshot.
            </div>
          ) : (
            versions.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="font-bold text-indigo-300 text-sm flex items-center gap-2">
                    <span>Version {v.version}</span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">
                      v{v.version}.0
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(v.createdAt).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {v.createdByUser?.name || "Owner"}
                    </span>
                  </div>
                  {v.changeLog && <p className="text-xs text-slate-500 italic mt-1">{v.changeLog}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

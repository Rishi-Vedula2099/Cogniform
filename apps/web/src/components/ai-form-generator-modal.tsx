"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Textarea,
} from "@cogniform/ui";
import { Sparkles, Wand2 } from "lucide-react";

interface AiFormGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AiFormGeneratorModal({ open, onOpenChange }: AiFormGeneratorModalProps) {
  const router = useRouter();
  const { activeWorkspace } = useAuthStore();

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !prompt.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const form = await api.post<any>("/ai/generate-form", {
        prompt,
        workspaceId: activeWorkspace.id,
      });

      setPrompt("");
      onOpenChange(false);
      router.push(`/forms/${form.id}/edit`);
    } catch (err: any) {
      setError(err.message || "Failed to generate form with AI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
        <form onSubmit={handleGenerate}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              Generate Form with AI
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Describe your form requirement in plain text and our AI engine will generate sections, field types, and options automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Textarea
                placeholder="e.g. Job Application form for Senior Software Engineer with contact info, portfolio link, experience level, and resume upload field..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="bg-slate-950/50 border-slate-800 text-white focus:border-indigo-500 min-h-[120px]"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25"
            >
              {loading ? (
                "Generating Form..."
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" /> Generate Form
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

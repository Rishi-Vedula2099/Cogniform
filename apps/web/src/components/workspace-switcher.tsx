"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@cogniform/ui";
import { api } from "@/lib/api";
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";

export function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, setActiveWorkspace, setAuth, user } = useAuthStore();
  const [openCreate, setOpenCreate] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const newWs = await api.post<any>("/workspaces", { name });
      const updatedProfile = await api.get<any>("/auth/me");
      
      setAuth(user, updatedProfile.workspaces);
      setActiveWorkspace({
        id: newWs.id,
        name: newWs.name,
        slug: newWs.slug,
        logo: newWs.logo,
        role: "OWNER",
      });
      setName("");
      setOpenCreate(false);
    } catch (err: any) {
      setError(err.message || "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-56 justify-between bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-800/80 hover:text-white"
          >
            <div className="flex items-center gap-2 truncate">
              <div className="h-5 w-5 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                {activeWorkspace?.name?.charAt(0).toUpperCase() || "W"}
              </div>
              <span className="truncate font-medium text-sm">
                {activeWorkspace?.name || "Select Workspace"}
              </span>
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-slate-900 border-slate-800 text-slate-200">
          <DropdownMenuLabel className="text-xs text-slate-400 font-semibold">
            Workspaces
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-800" />
          {workspaces.map((ws) => (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => setActiveWorkspace(ws)}
              className="flex items-center justify-between cursor-pointer focus:bg-slate-800 focus:text-white"
            >
              <div className="flex items-center gap-2 truncate">
                <Building2 className="h-4 w-4 text-slate-400" />
                <span className="truncate">{ws.name}</span>
              </div>
              {activeWorkspace?.id === ws.id && (
                <Check className="h-4 w-4 text-indigo-400 shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator className="bg-slate-800" />
          <DropdownMenuItem
            onClick={() => setOpenCreate(true)}
            className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 cursor-pointer focus:bg-slate-800 focus:text-indigo-300"
          >
            <Plus className="h-4 w-4" />
            <span className="font-medium">Create Workspace</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Create Workspace</DialogTitle>
              <DialogDescription className="text-slate-400">
                Create a new workspace to collaborate with team members on forms.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="ws-name">Workspace Name</Label>
                <Input
                  id="ws-name"
                  placeholder="e.g. Acme Marketing"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-950/50 border-slate-800 text-white focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpenCreate(false)}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                {loading ? "Creating..." : "Create Workspace"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

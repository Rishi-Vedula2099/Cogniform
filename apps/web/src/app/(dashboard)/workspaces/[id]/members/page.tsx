"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/lib/api";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@cogniform/ui";
import { Building2, MoreHorizontal, Shield, Trash2, UserPlus, Users } from "lucide-react";

interface Member {
  id: string;
  role: "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
  };
}

export default function WorkspaceMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: workspaceId } = use(params);

  const [workspace, setWorkspace] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite Dialog State
  const [openInvite, setOpenInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "EDITOR" | "VIEWER">("EDITOR");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const fetchWorkspace = async () => {
    try {
      const data = await api.get<any>(`/workspaces/${workspaceId}`);
      setWorkspace(data);
      setMembers(data.members || []);
    } catch (err) {
      console.error("Failed to load workspace members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, [workspaceId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError(null);

    try {
      await api.post(`/workspaces/${workspaceId}/members`, {
        email: inviteEmail,
        role: inviteRole,
      });

      setInviteEmail("");
      setOpenInvite(false);
      fetchWorkspace();
    } catch (err: any) {
      setInviteError(err.message || "Failed to invite member");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleUpdateRole = async (memberId: string, role: string) => {
    try {
      await api.patch(`/workspaces/${workspaceId}/members/${memberId}`, { role });
      fetchWorkspace();
    } catch (err: any) {
      alert(err.message || "Failed to update role");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
      fetchWorkspace();
    } catch (err: any) {
      alert(err.message || "Failed to remove member");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-slate-400">
        Loading team members...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Building2 className="h-8 w-8 text-indigo-400" />
            {workspace?.name} — Team & RBAC
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage workspace members, assign role-based permissions, and invite collaborators.
          </p>
        </div>

        <Button
          onClick={() => setOpenInvite(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
        >
          <UserPlus className="h-4 w-4" /> Invite Member
        </Button>
      </div>

      <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" />
            Members ({members.length})
          </CardTitle>
          <CardDescription className="text-slate-400">
            Current users with access to this workspace and their assigned roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-800">
            {members.map((m) => (
              <div key={m.id} className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white">
                    {m.user.name?.charAt(0).toUpperCase() || m.user.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-white flex items-center gap-2">
                      {m.user.name || "User"}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          m.role === "OWNER"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : m.role === "ADMIN"
                              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                              : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {m.role}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">{m.user.email}</div>
                  </div>
                </div>

                {m.role !== "OWNER" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                      <DropdownMenuItem
                        onClick={() => handleUpdateRole(m.id, "ADMIN")}
                        className="cursor-pointer focus:bg-slate-800"
                      >
                        <Shield className="h-4 w-4 mr-2 text-indigo-400" /> Make Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUpdateRole(m.id, "EDITOR")}
                        className="cursor-pointer focus:bg-slate-800"
                      >
                        Make Editor
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUpdateRole(m.id, "VIEWER")}
                        className="cursor-pointer focus:bg-slate-800"
                      >
                        Make Viewer
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRemoveMember(m.id)}
                        className="cursor-pointer text-red-400 focus:bg-slate-800 focus:text-red-300"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invite Member Dialog */}
      <Dialog open={openInvite} onOpenChange={setOpenInvite}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
          <form onSubmit={handleInvite}>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription className="text-slate-400">
                Send an invitation link to collaborate on this workspace.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {inviteError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {inviteError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email Address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="bg-slate-950/50 border-slate-800 text-white focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-role">Role</Label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full h-10 rounded-md bg-slate-950/50 border border-slate-800 px-3 text-sm text-white focus:border-indigo-500 outline-none"
                >
                  <option value="ADMIN">ADMIN — Full management access</option>
                  <option value="EDITOR">EDITOR — Create & edit forms</option>
                  <option value="VIEWER">VIEWER — View forms & responses</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpenInvite(false)}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={inviteLoading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                {inviteLoading ? "Sending..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

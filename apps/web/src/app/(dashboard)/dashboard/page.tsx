"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  Textarea,
} from "@cogniform/ui";
import {
  BarChart3,
  Building2,
  Clock,
  ExternalLink,
  FileText,
  FormInput,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";

interface FormSummary {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "CLOSED";
  isPublished: boolean;
  responseCount: number;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { activeWorkspace, user } = useAuthStore();

  const [forms, setForms] = useState<FormSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // New Form Dialog State
  const [openCreate, setOpenCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchForms = async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    try {
      const data = await api.get<FormSummary[]>(`/forms?workspaceId=${activeWorkspace.id}`);
      setForms(data);
    } catch (err) {
      console.error("Failed to load workspace forms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, [activeWorkspace?.id]);

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace) return;
    setCreateLoading(true);
    setCreateError(null);

    try {
      const newForm = await api.post<any>("/forms", {
        title,
        description,
        workspaceId: activeWorkspace.id,
      });

      setOpenCreate(false);
      setTitle("");
      setDescription("");
      router.push(`/forms/${newForm.id}/edit`);
    } catch (err: any) {
      setCreateError(err.message || "Failed to create form");
    } finally {
      setCreateLoading(false);
    }
  };

  const totalResponses = forms.reduce((sum, f) => sum + f.responseCount, 0);
  const publishedForms = forms.filter((f) => f.isPublished).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl px-8 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">Cogniform</span>
          </Link>

          <WorkspaceSwitcher />
        </div>

        <div className="flex items-center gap-4">
          {activeWorkspace && (
            <Button
              asChild
              variant="outline"
              className="border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white"
            >
              <Link href={`/workspaces/${activeWorkspace.id}/members`}>
                <Users className="h-4 w-4 mr-2" /> Team ({activeWorkspace.role})
              </Link>
            </Button>
          )}

          <Button
            onClick={() => setOpenCreate(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20"
          >
            <Plus className="h-4 w-4 mr-2" /> Create Form
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Forms</CardTitle>
              <FormInput className="h-4 w-4 text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{forms.length}</div>
              <p className="text-xs text-slate-500 mt-1">{publishedForms} published online</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Submissions</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalResponses}</div>
              <p className="text-xs text-slate-500 mt-1">Across all workspace forms</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Active Workspace</CardTitle>
              <Building2 className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-white truncate">
                {activeWorkspace?.name || "No Workspace"}
              </div>
              <p className="text-xs text-slate-500 mt-1">Role: {activeWorkspace?.role || "N/A"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Forms Grid Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Forms Overview</h2>
            <p className="text-slate-400 text-sm mt-1">
              Select a form to edit, view analytics, or preview responses.
            </p>
          </div>
        </div>

        {/* Forms Cards Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            Loading workspace forms...
          </div>
        ) : forms.length === 0 ? (
          <Card className="border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400">
              <FileText className="h-8 w-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-white">No forms created yet</h3>
              <p className="text-sm text-slate-400 mt-1">
                Get started by creating your first interactive form with custom validation rules and field renderers.
              </p>
            </div>
            <Button
              onClick={() => setOpenCreate(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              <Plus className="h-4 w-4 mr-2" /> Create First Form
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <Card
                key={form.id}
                className="border-slate-800 bg-slate-900/60 backdrop-blur-xl hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        form.isPublished
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {form.isPublished ? "PUBLISHED" : "DRAFT"}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(form.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-lg text-white font-bold truncate">
                    {form.title}
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-sm line-clamp-2">
                    {form.description || "No description provided."}
                  </CardDescription>
                </CardHeader>

                <CardFooter className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>{form.responseCount} Submissions</span>
                  <div className="flex items-center gap-2">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="text-indigo-400 hover:text-indigo-300 hover:bg-slate-800"
                    >
                      <Link href={`/forms/${form.id}/edit`}>Edit Builder</Link>
                    </Button>
                    {form.isPublished && (
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white hover:bg-slate-800 p-2"
                      >
                        <Link href={`/f/${form.slug}`} target="_blank">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Form Dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
          <form onSubmit={handleCreateForm}>
            <DialogHeader>
              <DialogTitle>Create New Form</DialogTitle>
              <DialogDescription className="text-slate-400">
                Enter a title and description for your new form.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {createError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {createError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="form-title">Form Title</Label>
                <Input
                  id="form-title"
                  placeholder="e.g. Customer Satisfaction Survey"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-slate-950/50 border-slate-800 text-white focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-desc">Description (Optional)</Label>
                <Textarea
                  id="form-desc"
                  placeholder="Brief explanation of the form purpose..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-slate-950/50 border-slate-800 text-white focus:border-indigo-500 min-h-[80px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpenCreate(false)}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createLoading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                {createLoading ? "Creating..." : "Create & Edit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

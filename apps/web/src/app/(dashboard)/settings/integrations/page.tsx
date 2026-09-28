"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
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
} from "@cogniform/ui";
import {
  ArrowRight,
  CheckCircle2,
  Globe,
  Plus,
  Send,
  Slack,
  Trash2,
  Webhook as WebhookIcon,
  Zap,
} from "lucide-react";

export default function IntegrationsSettingsPage() {
  const { activeWorkspace } = useAuthStore();

  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Webhook Dialog State
  const [openCreate, setOpenCreate] = useState(false);
  const [url, setUrl] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, string>>({});

  const fetchWebhooks = async () => {
    if (!activeWorkspace) return;
    try {
      const data = await api.get<any[]>(`/webhooks?workspaceId=${activeWorkspace.id}`);
      setWebhooks(data);
    } catch (err) {
      console.error("Failed to load webhooks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, [activeWorkspace?.id]);

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace) return;
    setCreateLoading(true);
    setCreateError(null);

    try {
      await api.post("/webhooks", {
        workspaceId: activeWorkspace.id,
        url,
        events: ["FORM_SUBMITTED"],
      });

      setUrl("");
      setOpenCreate(false);
      fetchWebhooks();
    } catch (err: any) {
      setCreateError(err.message || "Failed to add webhook");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleTestWebhook = async (id: string) => {
    setTestResult((prev) => ({ ...prev, [id]: "Testing..." }));
    try {
      const res = await api.post<any>(`/webhooks/${id}/test`);
      setTestResult((prev) => ({
        ...prev,
        [id]: res.success ? "Success (200 OK)" : res.message,
      }));
      fetchWebhooks();
    } catch (err: any) {
      setTestResult((prev) => ({ ...prev, [id]: err.message || "Dispatch Error" }));
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webhook?")) return;
    try {
      await api.delete(`/webhooks/${id}`);
      fetchWebhooks();
    } catch (err: any) {
      alert(err.message || "Failed to delete webhook");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Zap className="h-8 w-8 text-indigo-400" />
          Integrations & Webhooks
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Connect Cogniform with external tools or receive real-time HTTP webhooks on form submission events.
        </p>
      </div>

      {/* Integration Adapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
          <CardHeader>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-2">
              <Slack className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg text-white">Slack</CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Send instant notification messages to your team Slack channels on form submission.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full border-slate-800 bg-slate-950 text-slate-300">
              Connect Slack
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
          <CardHeader>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-2">
              <Globe className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg text-white">Google Sheets</CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Automatically append form answers into a live Google Sheet spreadsheet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full border-slate-800 bg-slate-950 text-slate-300">
              Connect Sheets
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
          <CardHeader>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-2">
              <Zap className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg text-white">Notion</CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Sync submissions into a Notion database table seamlessly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full border-slate-800 bg-slate-950 text-slate-300">
              Connect Notion
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Webhooks Section */}
      <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <WebhookIcon className="h-5 w-5 text-indigo-400" />
              Webhook Endpoints ({webhooks.length})
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm mt-1">
              HTTP POST requests signed with HMAC-SHA256 headers dispatched on form events.
            </CardDescription>
          </div>

          <Button
            onClick={() => setOpenCreate(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
          >
            <Plus className="h-4 w-4" /> Add Webhook
          </Button>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-slate-400">Loading webhooks...</div>
          ) : webhooks.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              No webhook endpoints configured for this workspace yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {webhooks.map((wh) => (
                <div key={wh.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="space-y-1 truncate">
                    <div className="font-mono text-sm text-indigo-300 font-semibold truncate">
                      {wh.url}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span>Secret: {wh.secret.slice(0, 10)}...</span>
                      <span>Success: {wh.successCount}</span>
                      <span>Failures: {wh.failureCount}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {testResult[wh.id] && (
                      <span className="text-xs font-mono text-slate-400">
                        {testResult[wh.id]}
                      </span>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestWebhook(wh.id)}
                      className="border-slate-800 bg-slate-950 text-slate-300 hover:text-white"
                    >
                      <Send className="h-3.5 w-3.5 mr-1" /> Test
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWebhook(wh.id)}
                      className="h-8 w-8 p-0 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Webhook Dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
          <form onSubmit={handleCreateWebhook}>
            <DialogHeader>
              <DialogTitle>Add Webhook Endpoint</DialogTitle>
              <DialogDescription className="text-slate-400">
                Cogniform will dispatch a signed HTTP POST payload when forms receive submissions.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {createError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {createError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Endpoint URL</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  placeholder="https://api.yourdomain.com/webhooks/cogniform"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-slate-950/50 border-slate-800 text-white focus:border-indigo-500 font-mono text-sm"
                  required
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
                {createLoading ? "Saving..." : "Add Endpoint"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@cogniform/ui";
import { ArrowLeft, BarChart3, Eye, Percent, Send, Sparkles } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#6366f1", "#a855f7", "#ec4899", "#10b981", "#f59e0b"];

export default function FormAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: formId } = use(params);

  const [form, setForm] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const formData = await api.get<any>(`/forms/${formId}`);
        const analyticsData = await api.get<any>(`/analytics/forms/${formId}`);
        setForm(formData);
        setAnalytics(analyticsData);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [formId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading analytics dashboard...
      </div>
    );
  }

  const deviceData = Object.entries(analytics?.deviceBreakdown || {}).map(([name, value]) => ({
    name: name.toUpperCase(),
    value: Number(value) || 0,
  }));

  const browserData = Object.entries(analytics?.browserBreakdown || {}).map(([name, value]) => ({
    name,
    value: Number(value) || 0,
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" className="text-slate-400 hover:text-white p-2">
            <Link href={`/forms/${formId}/edit`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>

          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-indigo-400" />
              {form?.title} — Analytics
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Real-time performance metrics, conversion rates, and respondent technology breakdowns.
            </p>
          </div>
        </div>

        <Button asChild variant="outline" className="border-slate-800 bg-slate-900 text-slate-300">
          <Link href={`/f/${form?.slug}`} target="_blank">
            <Eye className="h-4 w-4 mr-2" /> View Public Form
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Form Views</CardTitle>
            <Eye className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {analytics?.summary?.totalViews || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">Unique visitor impressions</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Responses</CardTitle>
            <Send className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {analytics?.summary?.totalResponses || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">Completed form submissions</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Conversion Rate</CardTitle>
            <Percent className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {analytics?.summary?.conversionRate || 0}%
            </div>
            <p className="text-xs text-slate-500 mt-1">Submissions / Views ratio</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Area Chart */}
        <Card className="lg:col-span-2 border-slate-800 bg-slate-900/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg text-white">Daily Traffic & Submissions</CardTitle>
            <CardDescription className="text-slate-400">
              Comparing daily views vs response submissions over time.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.dailyChart || []}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff" }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#6366f1"
                  fillOpacity={1}
                  fill="url(#colorViews)"
                />
                <Area
                  type="monotone"
                  dataKey="responses"
                  stroke="#a855f7"
                  fillOpacity={1}
                  fill="url(#colorResponses)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Breakdown Pie Chart */}
        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg text-white">Devices</CardTitle>
            <CardDescription className="text-slate-400">
              Respondent device distribution.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

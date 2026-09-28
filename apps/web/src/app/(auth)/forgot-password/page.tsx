"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input, Label } from "@cogniform/ui";
import { ArrowLeft, Mail, Sparkles } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to process password reset request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))] p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Reset Password</h1>
          <p className="text-sm text-slate-400 mt-1">
            We will send a reset link to your email address
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
          {submitted ? (
            <CardContent className="pt-6 space-y-4 text-center">
              <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-12 h-12 mx-auto flex items-center justify-center">
                <Mail className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-white">Check your email</h2>
              <p className="text-sm text-slate-400">
                If an account exists for <span className="text-white font-medium">{email}</span>, you will receive password reset instructions shortly.
              </p>
              <Button
                asChild
                className="w-full bg-slate-800 hover:bg-slate-700 text-white mt-4"
              >
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign In
                </Link>
              </Button>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl text-white">Forgot Password?</CardTitle>
                <CardDescription className="text-slate-400">
                  Enter your email address and we will send you a link to reset your password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-lg shadow-indigo-500/25 h-10"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>

                <p className="text-center text-xs text-slate-400">
                  Remembered your password?{" "}
                  <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

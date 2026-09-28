"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/lib/api";
import { evaluateCondition } from "@cogniform/utils";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from "@cogniform/ui";
import { ArrowLeft, ArrowRight, CheckCircle2, Send, Sparkles } from "lucide-react";

export default function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [form, setForm] = useState<any>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [startTime] = useState<number>(Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadForm() {
      try {
        const data = await api.get<any>(`/public/forms/${slug}`);
        setForm(data);
      } catch (err: any) {
        setError(err.message || "Form not found or unavailable.");
      } finally {
        setLoading(false);
      }
    }
    loadForm();
  }, [slug]);

  const handleInputChange = (fieldId: string, val: any) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: val }));
  };

  const sections = form?.sections || [];
  const currentSection = sections[currentSectionIndex];

  const evaluateFieldVisibility = (field: any): boolean => {
    if (!field.logicRules || field.logicRules.length === 0) return true;

    for (const rule of field.logicRules) {
      if (rule.action === "HIDE" && evaluateCondition(formValues[field.id], rule.operator, rule.value)) {
        return false;
      }
      if (rule.action === "SHOW" && !evaluateCondition(formValues[field.id], rule.operator, rule.value)) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const duration = Math.round((Date.now() - startTime) / 1000);

    try {
      await api.post(`/public/forms/${slug}/responses`, {
        answers: formValues,
        duration,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading form...
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-slate-800 bg-slate-900/60 p-8 text-center space-y-4">
          <h2 className="text-xl font-bold text-white">Form Unavailable</h2>
          <p className="text-sm text-slate-400">{error || "Form not found"}</p>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-slate-800 bg-slate-900/60 p-8 text-center space-y-4 shadow-2xl">
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Thank You!</h2>
          <p className="text-sm text-slate-400">
            Your response to <span className="text-white font-medium">{form.title}</span> has been successfully recorded.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))]">
      <div className="w-full max-w-2xl space-y-6">
        {/* Form Title Header */}
        <div className="text-center space-y-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-3">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{form.title}</h1>
          {form.description && (
            <p className="text-sm text-slate-400 max-w-lg mx-auto">{form.description}</p>
          )}
        </div>

        {/* Section Step Progress Bar */}
        {sections.length > 1 && (
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Section {currentSectionIndex + 1} of {sections.length}
            </span>
            <div className="flex-1 mx-4 h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${((currentSectionIndex + 1) / sections.length) * 100}%` }}
              />
            </div>
            <span>{Math.round(((currentSectionIndex + 1) / sections.length) * 100)}%</span>
          </div>
        )}

        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-xl text-white">
                {currentSection?.title || "Form Section"}
              </CardTitle>
              {currentSection?.description && (
                <CardDescription className="text-slate-400">
                  {currentSection.description}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {currentSection?.fields?.map((field: any) => {
                const visible = evaluateFieldVisibility(field);
                if (!visible) return null;

                return (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id} className="text-slate-200 font-medium flex items-center gap-1">
                      {field.label}
                      {field.required && <span className="text-red-400">*</span>}
                    </Label>

                    {/* Renderer per field type */}
                    {field.type === "TEXT" || field.type === "EMAIL" || field.type === "PHONE" || field.type === "URL" || field.type === "NUMBER" ? (
                      <Input
                        id={field.id}
                        type={
                          field.type === "EMAIL"
                            ? "email"
                            : field.type === "PHONE"
                              ? "tel"
                              : field.type === "NUMBER"
                                ? "number"
                                : "text"
                        }
                        placeholder={field.placeholder || ""}
                        value={formValues[field.id] || ""}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        required={field.required}
                        className="bg-slate-950/50 border-slate-800 text-white focus:border-indigo-500"
                      />
                    ) : field.type === "DROPDOWN" && field.options ? (
                      <select
                        id={field.id}
                        value={formValues[field.id] || ""}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        required={field.required}
                        className="w-full h-10 rounded-md bg-slate-950/50 border border-slate-800 px-3 text-sm text-white focus:border-indigo-500 outline-none"
                      >
                        <option value="">{field.placeholder || "Select option..."}</option>
                        {Array.isArray(field.options) &&
                          field.options.map((opt: any, idx: number) => (
                            <option key={idx} value={opt.value || opt.label}>
                              {opt.label}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <Textarea
                        id={field.id}
                        placeholder={field.placeholder || ""}
                        value={formValues[field.id] || ""}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        required={field.required}
                        className="bg-slate-950/50 border-slate-800 text-white focus:border-indigo-500"
                      />
                    )}

                    {field.helpText && (
                      <p className="text-xs text-slate-500">{field.helpText}</p>
                    )}
                  </div>
                );
              })}
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t border-slate-800/80 pt-4">
              {currentSectionIndex > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCurrentSectionIndex((prev) => prev - 1)}
                  className="text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
              ) : <div />}

              {currentSectionIndex < sections.length - 1 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentSectionIndex((prev) => prev + 1)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25"
                >
                  {submitting ? "Submitting..." : "Submit Form"}
                  {!submitting && <Send className="ml-2 h-4 w-4" />}
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { FIELD_TYPES, getFieldGroups, FieldTypeInfo } from "@cogniform/utils";
import { LogicRuleEditor } from "@/components/logic-rule-editor";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@cogniform/ui";
import {
  ArrowLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  CircleDot,
  Clock,
  Eye,
  Grid3x3,
  Hash,
  KeyRound,
  Link as LinkIcon,
  Mail,
  MapPin,
  Palette,
  PenTool,
  Phone,
  Plus,
  Star,
  Trash2,
  Type,
  Upload,
} from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Type,
  Mail,
  Phone,
  Hash,
  KeyRound,
  Link: LinkIcon,
  Calendar,
  Clock,
  CheckSquare,
  CircleDot,
  ChevronDown,
  Upload,
  Star,
  PenTool,
  MapPin,
  Palette,
  Grid3x3,
};

export default function FormBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: formId } = use(params);

  const [form, setForm] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [activeField, setActiveField] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fieldGroups = getFieldGroups();

  const fetchForm = async () => {
    try {
      const data = await api.get<any>(`/forms/${formId}`);
      setForm(data);
      setSections(data.sections || []);
      if (activeField) {
        const freshActive = data.sections
          ?.flatMap((s: any) => s.fields || [])
          ?.find((f: any) => f.id === activeField.id);
        if (freshActive) setActiveField(freshActive);
      } else if (data.sections?.[0]?.fields?.[0]) {
        setActiveField(data.sections[0].fields[0]);
      }
    } catch (err) {
      console.error("Failed to fetch form:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForm();
  }, [formId]);

  const handleAddField = async (typeInfo: FieldTypeInfo) => {
    if (!sections.length) return;
    const targetSection = sections[sections.length - 1];
    setSaving(true);

    try {
      const newField = await api.post(`/forms/sections/${targetSection.id}/fields`, {
        type: typeInfo.type,
        label: `Untitled ${typeInfo.label}`,
        placeholder: typeInfo.acceptsOptions ? "Select an option" : "Enter response...",
        required: false,
        options: typeInfo.acceptsOptions
          ? [
              { label: "Option 1", value: "option_1" },
              { label: "Option 2", value: "option_2" },
            ]
          : undefined,
      });

      await fetchForm();
      setActiveField(newField);
    } catch (err: any) {
      alert(err.message || "Failed to add field");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateActiveField = async (updates: any) => {
    if (!activeField) return;
    const updated = { ...activeField, ...updates };
    setActiveField(updated);

    try {
      await api.patch(`/forms/fields/${activeField.id}`, updates);
      fetchForm();
    } catch (err) {
      console.error("Failed to update field:", err);
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    try {
      await api.delete(`/forms/fields/${fieldId}`);
      if (activeField?.id === fieldId) {
        setActiveField(null);
      }
      fetchForm();
    } catch (err: any) {
      alert(err.message || "Failed to delete field");
    }
  };

  const handleTogglePublish = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await api.patch(`/forms/${form.id}`, {
        isPublished: !form.isPublished,
      });
      fetchForm();
    } catch (err: any) {
      alert(err.message || "Failed to publish form");
    } finally {
      setSaving(false);
    }
  };

  const allFields = sections.flatMap((s) => s.fields || []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading form builder...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Builder Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl px-6 py-3 flex items-center justify-between z-40">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" className="text-slate-400 hover:text-white p-2">
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>

          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              {form?.title}
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  form?.isPublished
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                {form?.isPublished ? "PUBLISHED" : "DRAFT"}
              </span>
            </h1>
            <p className="text-xs text-slate-400">Autosave enabled</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {form?.isPublished && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
            >
              <Link href={`/f/${form.slug}`} target="_blank">
                <Eye className="h-4 w-4 mr-2" /> Live Preview
              </Link>
            </Button>
          )}

          <Button
            onClick={handleTogglePublish}
            disabled={saving}
            className={
              form?.isPublished
                ? "bg-amber-600 hover:bg-amber-500 text-white"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
            }
          >
            {form?.isPublished ? "Unpublish" : "Publish Form"}
          </Button>
        </div>
      </header>

      {/* 3-Column Builder Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Palette: Field Elements Registry */}
        <aside className="w-72 border-r border-slate-800 bg-slate-900/40 p-4 overflow-y-auto space-y-6 shrink-0">
          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Add Field Elements (17 Types)
            </h2>
            <div className="space-y-4">
              {Object.entries(fieldGroups).map(([groupName, fields]) => (
                <div key={groupName} className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-300 capitalize">{groupName} Fields</h3>
                  <div className="grid grid-cols-1 gap-1.5">
                    {fields.map((f) => {
                      const IconComponent = ICON_MAP[f.icon] || Type;
                      return (
                        <button
                          key={f.type}
                          onClick={() => handleAddField(f)}
                          className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-800/80 bg-slate-950/40 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-left transition-all group"
                        >
                          <div className="h-7 w-7 rounded bg-slate-800 group-hover:bg-indigo-500/20 flex items-center justify-center text-slate-300 group-hover:text-indigo-400">
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-xs font-medium text-slate-200 group-hover:text-white">
                              {f.label}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center Canvas */}
        <main className="flex-1 p-8 overflow-y-auto bg-slate-950/80">
          <div className="max-w-2xl mx-auto space-y-6">
            {sections.map((section) => (
              <div key={section.id} className="space-y-4">
                <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">{section.title}</h2>
                  <span className="text-xs text-slate-500">{section.fields?.length || 0} fields</span>
                </div>

                <div className="space-y-3">
                  {section.fields?.map((field: any) => {
                    const typeInfo = FIELD_TYPES.find((t) => t.type === field.type);
                    const IconComponent = ICON_MAP[typeInfo?.icon || "Type"] || Type;
                    const isSelected = activeField?.id === field.id;

                    return (
                      <Card
                        key={field.id}
                        onClick={() => setActiveField(field)}
                        className={`cursor-pointer transition-all border ${
                          isSelected
                            ? "border-indigo-500 bg-slate-900/90 ring-1 ring-indigo-500"
                            : "border-slate-800/80 bg-slate-900/40 hover:border-slate-700"
                        }`}
                      >
                        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4 text-indigo-400" />
                            <CardTitle className="text-sm font-semibold text-white">
                              {field.label}
                              {field.required && <span className="text-red-400 ml-1">*</span>}
                              {field.isConditional && (
                                <span className="ml-2 text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded">
                                  Conditional
                                </span>
                              )}
                            </CardTitle>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteField(field.id);
                            }}
                            className="h-7 w-7 p-0 text-slate-500 hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <Input
                            disabled
                            placeholder={field.placeholder || "Input preview..."}
                            className="bg-slate-950/50 border-slate-800 text-slate-400 cursor-not-allowed h-9"
                          />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Right Inspector: Field Settings + Logic Engine */}
        <aside className="w-80 border-l border-slate-800 bg-slate-900/40 p-5 overflow-y-auto shrink-0">
          {activeField ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-bold text-white mb-1">Field Properties</h2>
                <p className="text-xs text-slate-400 uppercase tracking-wider">{activeField.type}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-300">Field Label</Label>
                  <Input
                    value={activeField.label || ""}
                    onChange={(e) => handleUpdateActiveField({ label: e.target.value })}
                    className="bg-slate-950/50 border-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-slate-300">Placeholder</Label>
                  <Input
                    value={activeField.placeholder || ""}
                    onChange={(e) => handleUpdateActiveField({ placeholder: e.target.value })}
                    className="bg-slate-950/50 border-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-slate-300">Help Text</Label>
                  <Input
                    value={activeField.helpText || ""}
                    onChange={(e) => handleUpdateActiveField({ helpText: e.target.value })}
                    className="bg-slate-950/50 border-slate-800 text-white"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 border border-slate-800">
                  <Label className="text-xs text-slate-300 cursor-pointer">Required Field</Label>
                  <input
                    type="checkbox"
                    checked={Boolean(activeField.required)}
                    onChange={(e) => handleUpdateActiveField({ required: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                {/* Conditional Logic Engine Component */}
                <LogicRuleEditor
                  field={activeField}
                  allFields={allFields}
                  onRefresh={fetchForm}
                />
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">
              Select a field on the canvas to configure its properties & logic rules.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

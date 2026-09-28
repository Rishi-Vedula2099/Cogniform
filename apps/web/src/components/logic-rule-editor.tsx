"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { evaluateCondition } from "@cogniform/utils";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@cogniform/ui";
import { LogicAction, LogicOperator } from "@prisma/client";
import { GitFork, Plus, Trash2 } from "lucide-react";

interface LogicRuleEditorProps {
  field: any;
  allFields: any[];
  onRefresh: () => void;
}

export function LogicRuleEditor({ field, allFields, onRefresh }: LogicRuleEditorProps) {
  const [action, setAction] = useState<LogicAction>("SHOW");
  const [operator, setOperator] = useState<LogicOperator>("EQUALS");
  const [value, setValue] = useState("");
  const [targetFieldId, setTargetFieldId] = useState("");
  const [loading, setLoading] = useState(false);

  const availableTargets = allFields.filter((f) => f.id !== field.id);

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/forms/fields/${field.id}/logic`, {
        action,
        operator,
        value,
        targetFieldId: targetFieldId || undefined,
      });

      setValue("");
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Failed to add logic rule");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await api.delete(`/forms/logic/${ruleId}`);
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Failed to delete logic rule");
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-800">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <GitFork className="h-3.5 w-3.5 text-indigo-400" /> Conditional Rules ({field.logicRules?.length || 0})
        </h3>
      </div>

      {/* Existing Rules List */}
      {field.logicRules && field.logicRules.length > 0 ? (
        <div className="space-y-2">
          {field.logicRules.map((rule: any) => {
            const target = availableTargets.find((f) => f.id === rule.targetFieldId);
            return (
              <div
                key={rule.id}
                className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between gap-2"
              >
                <div>
                  <span className="font-semibold text-indigo-400">{rule.action}</span>{" "}
                  {target ? <span className="text-white font-medium">&quot;{target.label}&quot;</span> : "this field"}{" "}
                  when value <span className="text-slate-400">{rule.operator.toLowerCase()}</span>{" "}
                  <span className="text-amber-300">&quot;{rule.value}&quot;</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteRule(rule.id)}
                  className="h-6 w-6 p-0 text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-slate-500">No conditional rules defined for this field.</p>
      )}

      {/* Add New Rule Form */}
      <form onSubmit={handleAddRule} className="space-y-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
        <div className="space-y-1">
          <Label className="text-xs text-slate-400">Action</Label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as LogicAction)}
            className="w-full h-8 rounded bg-slate-900 border border-slate-800 text-xs text-white px-2 outline-none"
          >
            <option value="SHOW">SHOW target field</option>
            <option value="HIDE">HIDE target field</option>
            <option value="REQUIRE">MAKE REQUIRED</option>
            <option value="DISABLE">DISABLE target field</option>
            <option value="SET_VALUE">SET VALUE</option>
          </select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-400">Target Field</Label>
          <select
            value={targetFieldId}
            onChange={(e) => setTargetFieldId(e.target.value)}
            className="w-full h-8 rounded bg-slate-900 border border-slate-800 text-xs text-white px-2 outline-none"
          >
            <option value="">(This Field)</option>
            {availableTargets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-slate-400">Condition</Label>
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value as LogicOperator)}
              className="w-full h-8 rounded bg-slate-900 border border-slate-800 text-xs text-white px-2 outline-none"
            >
              <option value="EQUALS">EQUALS</option>
              <option value="NOT_EQUALS">NOT EQUALS</option>
              <option value="CONTAINS">CONTAINS</option>
              <option value="GREATER_THAN">GREATER THAN</option>
              <option value="LESS_THAN">LESS THAN</option>
              <option value="IS_EMPTY">IS EMPTY</option>
              <option value="IS_NOT_EMPTY">IS NOT EMPTY</option>
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-slate-400">Value</Label>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Match value..."
              className="h-8 bg-slate-900 border-slate-800 text-xs text-white"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          size="sm"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-8 text-xs gap-1 mt-1"
        >
          <Plus className="h-3.5 w-3.5" /> Add Rule
        </Button>
      </form>
    </div>
  );
}

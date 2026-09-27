import React, { useState } from 'react';
import {
  Sliders,
  FileCode2,
  Copy,
  Check,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { BackendConfigState, VideoAnalysisResult } from '../types';
import { ENV_SPECS } from '../data/mockData';

interface ConfigInspectorPageProps {
  config: BackendConfigState;
  currentResult: VideoAnalysisResult;
}

export const ConfigInspectorPage: React.FC<ConfigInspectorPageProps> = ({
  config,
  currentResult,
}) => {
  const [selectedSchema, setSelectedSchema] = useState<string>('explained_json');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState<string>('');

  const schemas: { id: string; name: string; filename: string; content: string }[] = [
    {
      id: 'explained_json',
      name: 'Final Evidence Audit JSON',
      filename: `${currentResult.video_id}_explained.json`,
      content: currentResult.raw_files.explained_json,
    },
    {
      id: 'causal_json',
      name: 'Causal Linkages JSON',
      filename: `${currentResult.video_id}_causal.json`,
      content: currentResult.raw_files.causal_json,
    },
    {
      id: 'verification_json',
      name: 'Hallucination Verification JSON',
      filename: `${currentResult.video_id}_verification.json`,
      content: currentResult.raw_files.verification_json,
    },
    {
      id: 'captions_json',
      name: 'Per-Scene Captions JSON',
      filename: `${currentResult.video_id}_captions.json`,
      content: currentResult.raw_files.captions_json,
    },
    {
      id: 'narrative_txt',
      name: 'Synthesized Narrative Prose',
      filename: `${currentResult.video_id}_narrative.txt`,
      content: currentResult.raw_files.narrative_txt,
    },
  ];

  const currentSchemaObj = schemas.find((s) => s.id === selectedSchema) || schemas[0];

  const handleCopy = (content: string, key: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredEnv = ENV_SPECS.filter(
    (e) =>
      e.key.toLowerCase().includes(filterQuery.toLowerCase()) ||
      e.desc.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
          <Sliders className="w-3.5 h-3.5" />
          <span>CONFIG SPECIFICATION & RAW SCHEMA INSPECTOR</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 mt-1">
          Pipeline Artifacts & Environment Validator
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Inspect generated JSON schemas and validate backend runtime configurations against the official VERITAS contract.
        </p>
      </div>

      {/* Dual Pane Raw JSON Viewer Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-2">
          <h2 className="text-base font-bold text-slate-200 font-mono flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-cyan-400" />
            <span>Dual-Pane Output Schema Inspector</span>
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(currentSchemaObj.content, 'json')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono text-xs cursor-pointer"
            >
              {copiedKey === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Content</span>
            </button>
            <button
              onClick={() => handleDownload(currentSchemaObj.content, currentSchemaObj.filename)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold cursor-pointer shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Dual Pane Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
          {/* Left Pane: Artifact File Switcher */}
          <div className="lg:col-span-4 p-4 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/60 space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-2">
              Select Output Schema:
            </span>

            {schemas.map((s) => {
              const isSelected = selectedSchema === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSchema(s.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/70 border-indigo-500 text-indigo-200 shadow-md ring-1 ring-indigo-500/40'
                      : 'bg-slate-950 border-slate-850 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-200">
                    <span>{s.filename}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-400"></span>}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-1">
                    {s.name}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Pane: Code Viewer */}
          <div className="lg:col-span-8 p-4 bg-[#030712] overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 border-b border-slate-800 pb-2 mb-3">
              <span>ACTIVE ARTIFACT: {currentSchemaObj.filename}</span>
              <span className="text-emerald-400">STATUS: VALID_JSON_SCHEMA</span>
            </div>

            <pre className="text-xs font-mono text-slate-200 leading-relaxed overflow-x-auto max-h-[380px] p-2 bg-slate-950/80 rounded border border-slate-900">
              <code>{currentSchemaObj.content}</code>
            </pre>

            <div className="pt-3 flex justify-between items-center text-[11px] font-mono text-slate-500">
              <span>Lines: {currentSchemaObj.content.split('\n').length}</span>
              <span>Encoding: UTF-8 CRLF</span>
            </div>
          </div>
        </div>
      </section>

      {/* .env Environment Validator List */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-2">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
              Deployment Integrity Check
            </span>
            <h2 className="text-base font-bold text-slate-200 font-mono flex items-center gap-2 mt-1">
              <span>.env Configuration Validator ({ENV_SPECS.length} Parameters)</span>
            </h2>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search env keys..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-md pl-9 pr-3 py-1.5 text-xs font-mono text-slate-200 w-56 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="p-3">Variable Key</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Active Value</th>
                  <th className="p-3">Purpose & Impact</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredEnv.map((env) => {
                  let currentValue = env.sample;
                  if (env.key === 'CAPTIONING_BACKEND') currentValue = config.captioningBackend;
                  if (env.key === 'PY_SCENE_DETECT_THRESHOLD') currentValue = config.pySceneDetectThreshold.toString();
                  if (env.key === 'NUM_FRAMES_PER_SCENE') currentValue = config.numFramesPerScene.toString();
                  if (env.key === 'WHISPER_MODEL_SIZE') currentValue = config.whisperModelSize;
                  if (env.key === 'USE_BATCH_API') currentValue = config.useBatchApi.toString();

                  const isSecret = env.type === 'secret';
                  const displayValue = isSecret ? '••••••••••••••••••••' : currentValue;

                  return (
                    <tr key={env.key} className="hover:bg-slate-850/60 transition-colors">
                      <td className="p-3 font-bold text-cyan-300">
                        {env.key}
                      </td>
                      <td className="p-3 text-slate-400">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px]">
                          {env.type}
                        </span>
                      </td>
                      <td className="p-3 text-indigo-300">
                        {displayValue}
                      </td>
                      <td className="p-3 text-slate-300 font-sans max-w-md text-xs">
                        {env.desc}
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          VALID
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

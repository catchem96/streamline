/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WORKFLOW_PRESETS, WorkflowPreset } from '../presets';
import { ConnectionStyle } from '../types';
import { 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Search, 
  AlertOctagon, 
  LayoutTemplate,
  Spline,
  GitCommit,
  Heading,
  Copy,
  Check,
  Save,
  FolderOpen,
  HelpCircle,
  X
} from 'lucide-react';

interface ToolbarProps {
  onAddNode: () => void;
  onClearAll: () => void;
  onLoadPreset: (preset: WorkflowPreset) => void;
  onExportJSON: () => void;
  onImportJSON: (jsonString: string) => boolean;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  filterHighPriorityOnly: boolean;
  onFilterHighPriorityChange: (val: boolean) => void;
  defaultConnectionStyle: ConnectionStyle;
  onChangeDefaultConnectionStyle: (val: ConnectionStyle) => void;
  customSaves: Array<{ id: string; name: string }>;
  onSaveWorkflow: (name: string) => void;
  onLoadCustomSave: (id: string) => void;
  onDeleteCustomSave: (id: string) => void;
  showHelp: boolean;
  onToggleHelp: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddNode,
  onClearAll,
  onLoadPreset,
  onExportJSON,
  onImportJSON,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  searchTerm,
  onSearchChange,
  filterHighPriorityOnly,
  onFilterHighPriorityChange,
  defaultConnectionStyle,
  onChangeDefaultConnectionStyle,
  customSaves,
  onSaveWorkflow,
  onLoadCustomSave,
  onDeleteCustomSave,
  showHelp,
  onToggleHelp
}) => {
  const [showImportBox, setShowImportBox] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [copiedPreset, setCopiedPreset] = useState(false);

  // Custom saves and loads UI states
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showLoadDropdown, setShowLoadDropdown] = useState(false);

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError('');
    const success = onImportJSON(importText);
    if (success) {
      setShowImportBox(false);
      setImportText('');
    } else {
      setImportError('Invalid JSON structure. Please check details and try again.');
    }
  };

  return (
    <div id="app-toolbar" className="flex flex-col bg-slate-900 text-white px-4 py-3 border-b border-slate-850 gap-3 shrink-0 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Logo and Presets */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-violet-600 rounded-lg shadow-inner">
              <Spline className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight font-sans text-slate-150">
                Streamline
              </h1>
              <p className="text-[10px] text-slate-400 font-mono -mt-1">
                INTERACTIVE PIPELINE BUILDER
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-750 hidden md:block" />

          {/* Preset Selector */}
          <div className="flex items-center gap-1.5">
            <LayoutTemplate className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              onChange={(e) => {
                const p = WORKFLOW_PRESETS.find(pr => pr.name === e.target.value);
                if (p) onLoadPreset(p);
              }}
              defaultValue="E-Commerce Architecture"
              className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:ring-1 focus:ring-violet-500 max-w-[190px] cursor-pointer"
            >
              {WORKFLOW_PRESETS.map((preset) => (
                <option key={preset.name} value={preset.name}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action buttons inside Canvas */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-medium">
          <button
            onClick={onAddNode}
            className="flex items-center gap-1 bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Box
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to clear the workflow canvas? This will wipe all nodes & connections.')) {
                onClearAll();
              }
            }}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg active:scale-95 transition-all border border-slate-700 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-400" /> Wreck Canvas
          </button>

          <div className="h-6 w-px bg-slate-750" />

          {/* Connection Style Selector */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => onChangeDefaultConnectionStyle(ConnectionStyle.CURVE)}
              title="Curved Bezier Connections"
              className={`px-2 py-1 rounded transition-colors text-xs flex items-center gap-1 cursor-pointer ${
                defaultConnectionStyle === ConnectionStyle.CURVE 
                  ? 'bg-violet-600 text-white font-semibold' 
                  : 'text-slate-450 hover:text-slate-200'
              }`}
            >
              <Spline className="w-3.5 h-3.5" />
              <span className="hidden leading-none sm:inline">Curves</span>
            </button>
            <button
              onClick={() => onChangeDefaultConnectionStyle(ConnectionStyle.ORTHOGONAL)}
              title="Stepped Orthogonal Connections"
              className={`px-2 py-1 rounded transition-colors text-xs flex items-center gap-1 cursor-pointer ${
                defaultConnectionStyle === ConnectionStyle.ORTHOGONAL 
                  ? 'bg-violet-600 text-white font-semibold' 
                  : 'text-slate-450 hover:text-slate-200'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span className="hidden leading-none sm:inline">Orthogonal</span>
            </button>
            <button
              onClick={() => onChangeDefaultConnectionStyle(ConnectionStyle.STRAIGHT)}
              title="Straight Arrow Connections"
              className={`px-2 py-1 rounded transition-colors text-xs flex items-center gap-1 cursor-pointer ${
                defaultConnectionStyle === ConnectionStyle.STRAIGHT 
                  ? 'bg-violet-600 text-white font-semibold' 
                  : 'text-slate-450 hover:text-slate-200'
              }`}
            >
              <Heading className="w-3.5 h-3.5 -rotate-45" />
              <span className="hidden leading-none sm:inline">Straight</span>
            </button>
          </div>

          <div className="h-6 w-px bg-slate-750" />

          {/* Export / Import tools */}
          <button
            onClick={onExportJSON}
            title="Export workflow schema to clipboard"
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export
          </button>

          <button
            onClick={() => {
              setShowImportBox(!showImportBox);
              setShowSaveForm(false);
              setShowLoadDropdown(false);
            }}
            title="Import workflow schema from JSON text"
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg cursor-pointer"
          >
            <Upload className="w-4 h-4" /> Import
          </button>

          <div className="h-6 w-px bg-slate-750 hidden md:block" />

          {/* Custom Save / Load Workflow slots requested */}
          <button
            onClick={() => {
              setShowSaveForm(!showSaveForm);
              setShowLoadDropdown(false);
              setShowImportBox(false);
            }}
            title="Save workflow layout to active local storage list"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              showSaveForm 
                ? 'bg-emerald-600 text-white font-semibold font-sans border-emerald-500' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Save className="w-4 h-4 text-emerald-400" /> Safe-Save
          </button>

          <button
            onClick={() => {
              setShowLoadDropdown(!showLoadDropdown);
              setShowSaveForm(false);
              setShowImportBox(false);
            }}
            title="Load workflow state from list of saved templates"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              showLoadDropdown 
                ? 'bg-amber-600 text-white font-semibold font-sans border-amber-500' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-amber-400" /> Safe-Load ({customSaves.length})
          </button>

          <div className="h-6 w-px bg-slate-750 hidden md:block" />

          {/* Collapsible Help Guide Toggle */}
          <button
            onClick={onToggleHelp}
            title="Toggle user helper guide instruction card"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer border ${
              showHelp 
                ? 'bg-indigo-600 border-indigo-500 text-white font-semibold' 
                : 'bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-700'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-sky-400" /> Guide: {showHelp ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Save layout panel */}
      {showSaveForm && (
        <div className="bg-slate-800 p-4 rounded-xl border border-emerald-500/30 animate-in fade-in-25 duration-150 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Save className="w-4 h-4" /> Save Current Workflow State
            </h3>
            <button
              type="button"
              onClick={() => setShowSaveForm(false)}
              className="text-slate-400 hover:text-slate-200 text-xs font-mono"
            >
              [Cancel]
            </button>
          </div>
          <div className="flex gap-2 max-w-lg">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g. Production Pipeline, Sales Flow..."
              className="flex-1 py-1.5 px-3 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-emerald-500 placeholder-slate-600"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSaveWorkflow(saveName);
                  setSaveName('');
                  setShowSaveForm(false);
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                onSaveWorkflow(saveName);
                setSaveName('');
                setShowSaveForm(false);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer shadow-md"
            >
              Save Slot
            </button>
          </div>
        </div>
      )}

      {/* Load layout slot panel */}
      {showLoadDropdown && (
        <div className="bg-slate-800 p-4 rounded-xl border border-amber-500/30 animate-in fade-in-25 duration-150 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4" /> Load Custom Workflows
            </h3>
            <button
              type="button"
              onClick={() => setShowLoadDropdown(false)}
              className="text-slate-400 hover:text-slate-200 text-xs font-mono"
            >
              [Close]
            </button>
          </div>
          {customSaves.length === 0 ? (
            <p className="text-xs text-slate-400 font-mono py-1">
              No saved workflows found in this browser. Type a name and click "Safe-Save" above to persist your current setup.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 py-1 max-h-48 overflow-y-auto custom-scrollbar">
              {customSaves.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between bg-slate-900/80 hover:bg-slate-900 rounded-lg p-2.5 border border-slate-750/70 transition-all text-xs"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onLoadCustomSave(slot.id);
                      setShowLoadDropdown(false);
                    }}
                    className="flex-1 text-left text-slate-200 hover:text-violet-400 font-semibold truncate pr-2 cursor-pointer"
                    title={`Load "${slot.name}"`}
                  >
                    📂 {slot.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCustomSave(slot.id)}
                    className="text-rose-450 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 cursor-pointer transition-colors"
                    title="Delete saved slot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* JSON Import collapsible tray */}
      {showImportBox && (
        <form onSubmit={handleImportSubmit} className="bg-slate-800 p-4 rounded-xl border border-slate-700 animate-in fade-in-25 duration-150 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
              Paste Workflow JSON Schema
            </h3>
            <button
              type="button"
              onClick={() => setShowImportBox(false)}
              className="text-slate-400 hover:text-slate-200 text-xs font-mono"
            >
              [Cancel]
            </button>
          </div>
          
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={3}
            placeholder='e.g., {"nodes": [], "connections": []}'
            className="w-full text-xs font-mono bg-slate-900 border border-slate-750 text-emerald-400 p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 placeholder-slate-600"
            required
          />

          {importError && (
            <p className="text-xs text-rose-400 font-mono">
              ⚠️ {importError}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-505 text-white font-semibold text-xs px-4 py-1.5 rounded-lg active:scale-95 cursor-pointer"
            >
              Validate & Import Schema
            </button>
          </div>
        </form>
      )}

      {/* Grid Filtering options, Search & Zoom widgets */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/60 pt-2.5 text-xs text-slate-350">
        <div className="flex items-center gap-4 flex-wrap flex-1">
          {/* Search container */}
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search boxes, tasks or system tags..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800/80 border border-slate-700/80 rounded-lg text-slate-150 outline-none focus:bg-slate-850 focus:border-slate-500 placeholder-slate-500"
            />
          </div>

          {/* Quick filter high priority checkbox */}
          <label className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors select-none cursor-pointer">
            <input
              type="checkbox"
              checked={filterHighPriorityOnly}
              onChange={(e) => onFilterHighPriorityChange(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-violet-500 focus:ring-opacity-40 focus:ring-violet-500 h-4 w-4"
            />
            <span className="flex items-center gap-1 text-xs">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              Focus High Priority Only
            </span>
          </label>
        </div>

        {/* Zoom Control Module */}
        <div className="flex items-center gap-2 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/60 font-mono text-xs">
          <span className="text-slate-400 mr-1.5 uppercase text-[10px] tracking-wider">Scale:</span>
          <button
            onClick={onZoomOut}
            title="Zoom Out"
            disabled={zoom <= 0.4}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-700 disabled:opacity-30 rounded cursor-pointer shrink-0"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="w-12 text-center text-slate-200 font-semibold text-[11px]">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            title="Zoom In"
            disabled={zoom >= 1.8}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-700 disabled:opacity-30 rounded cursor-pointer shrink-0"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-slate-700" />
          <button
            onClick={onZoomReset}
            title="Recenter"
            className="text-[10px] text-slate-450 hover:text-white px-1 hover:bg-slate-700 rounded flex items-center gap-0.5 cursor-pointer"
          >
            <Maximize className="w-3 h-3" />
            <span>Fit</span>
          </button>
        </div>
      </div>
    </div>
  );
};

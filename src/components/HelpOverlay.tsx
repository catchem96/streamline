/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HelpCircle, Plus, Move, Link2, Info, Keyboard, MousePointerClick } from 'lucide-react';

interface HelpOverlayProps {
  onClose?: () => void;
}

export const HelpOverlay: React.FC<HelpOverlayProps> = ({ onClose }) => {
  return (
    <div id="help-overlay-card" className="bg-white/95 backdrop-blur border border-slate-200 shadow-xl rounded-xl p-5 max-w-sm text-slate-700 space-y-4 animate-in fade-in-50 duration-150">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h4 className="font-bold text-sm font-mono text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
          <HelpCircle className="w-4 h-4 text-violet-500" />
          Workflow Guide
        </h4>
        {onClose && (
          <button
            onClick={onClose}
            className="text-[10px] font-mono px-1.5 py-0.5 text-slate-400 hover:text-slate-600 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer"
          >
            [Hide]
          </button>
        )}
      </div>

      <div className="space-y-3.5 text-xs">
        <div className="flex items-start gap-2.5">
          <div className="p-1 rounded bg-violet-50 shrink-0 text-violet-600 mt-0.5">
            <Plus className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Add Box</p>
            <p className="text-slate-500 leading-normal">
              Double-click anywhere on the grid canvas, or click the <span className="font-semibold text-slate-700">"+ Add Box"</span> button in the toolbar.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="p-1 rounded bg-indigo-50 shrink-0 text-indigo-600 mt-0.5">
            <Move className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Move & Pan</p>
            <p className="text-slate-500 leading-normal">
              Drag boxes by holding their header tags. Hold & drag the grey grid background to pan around the infinite workflow space.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="p-1 rounded bg-amber-50 shrink-0 text-amber-600 mt-0.5">
            <Link2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Create Arrows & Connections</p>
            <p className="text-slate-500 leading-normal">
              Click the <span className="font-semibold text-slate-700">"🔗 Connect"</span> icon on a box to enter connection mode, then click any other box to form a custom flow arrow. Change line styles (Bezier, Straight, Orthogonal) at will!
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="p-1 rounded bg-emerald-50 shrink-0 text-emerald-600 mt-0.5">
            <MousePointerClick className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Organize Internal Tiers</p>
            <p className="text-slate-500 leading-normal">
              Click any box to open the editor. Add customized levels inside (like checklists, database tags, or process priority scores).
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center gap-2 text-[10px] text-slate-500">
        <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        <span>Tip: Hover and click on connection arrow tags to customize their labels or delete lines.</span>
      </div>
    </div>
  );
};

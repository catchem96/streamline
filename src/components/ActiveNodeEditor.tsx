/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WorkflowNode, CustomLevelItem, Priority } from '../types';
import { COLORS } from '../presets';
import { Plus, Trash2, CheckCircle, Circle, AlertCircle, Sparkles, Layers, Check, Tag } from 'lucide-react';

interface ActiveNodeEditorProps {
  node: WorkflowNode;
  onUpdate: (updatedNode: WorkflowNode) => void;
  onDelete: () => void;
  onClose: () => void;
}

export const ActiveNodeEditor: React.FC<ActiveNodeEditorProps> = ({
  node,
  onUpdate,
  onDelete,
  onClose
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemPriority, setNewItemPriority] = useState<Priority>(Priority.MEDIUM);
  const [newItemSystem, setNewItemSystem] = useState('');

  const updateField = (key: keyof WorkflowNode, value: any) => {
    onUpdate({
      ...node,
      [key]: value
    });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: CustomLevelItem = {
      id: `item-${Date.now()}`,
      name: newItemName.trim(),
      priority: newItemPriority,
      systemTag: newItemSystem.trim() || undefined,
      completed: false
    };

    updateField('levelItems', [...node.levelItems, newItem]);
    setNewItemName('');
    setNewItemSystem('');
    setNewItemPriority(Priority.MEDIUM);
  };

  const handleRemoveItem = (itemId: string) => {
    updateField('levelItems', node.levelItems.filter(item => item.id !== itemId));
  };

  const handleToggleItemCompleted = (itemId: string) => {
    updateField(
      'levelItems',
      node.levelItems.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const currentBoxColorMeta = COLORS.find(c => c.id === node.color) || COLORS[0];

  return (
    <div id="active-node-editor" className="flex flex-col h-full bg-white border-l border-slate-200 w-80 lg:w-96 overflow-y-auto animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${node.color === 'rose' ? 'bg-rose-500' : node.color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
          <h3 className="font-semibold text-slate-800 text-sm tracking-tight truncate">
            Configure Workflow Box
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-xs font-mono px-2 py-1 text-slate-400 hover:text-slate-600 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer"
        >
          [Close]
        </button>
      </div>

      <div className="p-5 flex-1 space-y-6">
        {/* Title & Description */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 font-mono uppercase tracking-wider">
              Box Title
            </label>
            <input
              type="text"
              value={node.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full text-sm font-medium text-slate-800 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
              placeholder="Name of this workflow step"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 font-mono uppercase tracking-wider">
              System/Level Description
            </label>
            <textarea
              value={node.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={2}
              className="w-full text-xs text-slate-600 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 resize-none"
              placeholder="Brief description of process or layer duties..."
            />
          </div>
        </div>

        {/* Global Node Attributes */}
        <div className="border-t border-slate-100 pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 font-mono uppercase tracking-wider">
                Overall Priority
              </label>
              <select
                value={node.nodePriority}
                onChange={(e) => updateField('nodePriority', e.target.value as Priority)}
                className="w-full text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-violet-500 focus:outline-none"
              >
                <option value={Priority.HIGH}>🔴 High Priority</option>
                <option value={Priority.MEDIUM}>🟡 Medium Priority</option>
                <option value={Priority.LOW}>🟢 Low Priority</option>
                <option value={Priority.INFO}>🔵 Info/Reference</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 font-mono uppercase tracking-wider">
                System Tag
              </label>
              <input
                type="text"
                value={node.systemTag || ''}
                onChange={(e) => updateField('systemTag', e.target.value)}
                className="w-full text-xs font-medium text-slate-700 border border-slate-200 rounded-lg p-2 bg-slate-50 border-dashed focus:bg-white focus:outline-none"
                placeholder="e.g. Db, Auth"
              />
            </div>
          </div>

          {/* Color Selection Accent */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 font-mono uppercase tracking-wider">
              Accent Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateField('color', c.id)}
                  title={c.id}
                  className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                    node.color === c.id
                      ? 'border-slate-800 scale-110 shadow-sm'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.raw }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Levels Organiser (Internal priorities or sub-systems) */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold font-mono text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Inside Box Levels & Priorities
            </h4>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-mono">
              {node.levelItems.length} Tiers
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-normal">
            Organize nested priority actions, target components, or subsystem layers belonging inside this pipeline box.
          </p>

          {/* List of sub items */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {node.levelItems.length === 0 ? (
              <div className="text-center p-4 border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                No nested system levels added. Add one below!
              </div>
            ) : (
              node.levelItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start justify-between p-2 rounded-lg border text-xs gap-2 transition-colors ${
                    item.completed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <button
                    onClick={() => handleToggleItemCompleted(item.id)}
                    className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors shrink-0 cursor-pointer"
                  >
                    {item.completed ? (
                      <CheckCircle className="w-4.5 h-4.5 text-emerald-500 fill-emerald-50" />
                    ) : (
                      <Circle className="w-4.5 h-4.5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {item.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold font-mono ${
                          item.priority === Priority.HIGH
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : item.priority === Priority.MEDIUM
                            ? 'bg-amber-50 text-amber-600 border border-amber-100'
                            : item.priority === Priority.LOW
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}
                      >
                        {item.priority}
                      </span>
                      {item.systemTag && (
                        <span className="text-[9px] bg-slate-100 text-slate-600 font-mono px-1.5 rounded flex items-center gap-0.5">
                          <Tag className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                          {item.systemTag}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-slate-300 hover:text-red-500 p-1 rounded hover:bg-slate-50 shrink-0 cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Form to add item */}
          <form onSubmit={handleAddItem} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-2 mt-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Add nested task or service..."
              className="w-full text-xs border border-slate-200 bg-white rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />

            <div className="flex gap-1.5 items-center justify-between">
              <select
                value={newItemPriority}
                onChange={(e) => setNewItemPriority(e.target.value as Priority)}
                className="text-[10px] bg-white border border-slate-200 rounded p-1 focus:outline-none text-slate-700"
              >
                <option value={Priority.HIGH}>🔴 High</option>
                <option value={Priority.MEDIUM}>🟡 Medium</option>
                <option value={Priority.LOW}>🟢 Low</option>
                <option value={Priority.INFO}>🔵 Info</option>
              </select>

              <input
                type="text"
                value={newItemSystem}
                onChange={(e) => setNewItemSystem(e.target.value)}
                placeholder="Tag (e.g. API)"
                className="w-24 text-[10px] border border-slate-200 bg-white rounded p-1 focus:outline-none"
              />

              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-900 text-white rounded p-1 flex items-center justify-center cursor-pointer hover:shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer Dangerous actions */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
        <button
          onClick={onDelete}
          className="text-xs text-red-600 font-semibold px-3 py-2 border border-red-200 rounded-lg bg-white hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer w-full justify-center"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete Box Entirely
        </button>
      </div>
    </div>
  );
};

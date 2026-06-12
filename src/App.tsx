/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { WorkflowNode, Connection, Priority, ConnectionStyle, CanvasState } from './types';
import { WORKFLOW_PRESETS, WorkflowPreset } from './presets';
import { Toolbar } from './components/Toolbar';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { ActiveNodeEditor } from './components/ActiveNodeEditor';
import { HelpOverlay } from './components/HelpOverlay';
import { 
  Undo2, 
  Redo2, 
  HelpCircle, 
  Info, 
  Sparkles, 
  CheckCircle2, 
  X,
  FileJson
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'workflowy_lite_workspace';

export default function App() {
  // --- Canvas Core States ---
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [zoom, setZoom] = useState<number>(1.0);
  const [panX, setPanX] = useState<number>(50);
  const [panY, setPanY] = useState<number>(30);

  // --- UI Filter & Selection States ---
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterHighPriorityOnly, setFilterHighPriorityOnly] = useState<boolean>(false);
  const [defaultConnectionStyle, setDefaultConnectionStyle] = useState<ConnectionStyle>(ConnectionStyle.CURVE);
  const [showHelp, setShowHelp] = useState<boolean>(true);

  // --- Dynamic Custom Save/Load States ---
  const [customSaves, setCustomSaves] = useState<Array<{ id: string; name: string; nodes: WorkflowNode[]; connections: Connection[] }>>([]);

  useEffect(() => {
    const list = localStorage.getItem('streamline_custom_saves');
    if (list) {
      try {
        setCustomSaves(JSON.parse(list));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSaveWorkflow = (name: string) => {
    const nameStr = name.trim();
    const newSave = {
      id: `save-${Date.now()}`,
      name: nameStr || `Custom Layout ${customSaves.length + 1}`,
      nodes,
      connections
    };
    const nextSaves = [newSave, ...customSaves];
    setCustomSaves(nextSaves);
    localStorage.setItem('streamline_custom_saves', JSON.stringify(nextSaves));
    showToast(`Saved workflow as "${newSave.name}" successfully!`, 'success');
  };

  const handleLoadCustomSave = (id: string) => {
    const target = customSaves.find(s => s.id === id);
    if (target) {
      setNodes(target.nodes);
      setConnections(target.connections);
      setSelectedNodeId(null);
      setPanX(50);
      setPanY(30);
      setZoom(1.0);
      pushToHistory(target.nodes, target.connections);
      showToast(`Loaded layout "${target.name}"!`, 'success');
    }
  };

  const handleDeleteCustomSave = (id: string) => {
    const nextSaves = customSaves.filter(s => s.id !== id);
    setCustomSaves(nextSaves);
    localStorage.setItem('streamline_custom_saves', JSON.stringify(nextSaves));
    showToast('Deleted saved workflow slot', 'info');
  };

  // --- Interactive Alert/Feedback Toast states ---
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');

  // --- Undo/Redo State History ---
  const [history, setHistory] = useState<Array<{ nodes: WorkflowNode[]; connections: Connection[] }>>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Load Initial Dataset
  useEffect(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as { nodes: WorkflowNode[]; connections: Connection[] };
        if (Array.isArray(parsed.nodes) && Array.isArray(parsed.connections)) {
          setNodes(parsed.nodes);
          setConnections(parsed.connections);
          // Seed initial history
          setHistory([{ nodes: parsed.nodes, connections: parsed.connections }]);
          setHistoryIndex(0);
          showToast('Restored workspace from browser storage', 'success');
          return;
        }
      } catch (e) {
        console.error('Failed to parse cached workspace storage', e);
      }
    }

    // Default to first preset (E-Commerce Architecture)
    const defaultPreset = WORKFLOW_PRESETS[0];
    setNodes(defaultPreset.nodes);
    setConnections(defaultPreset.connections);
    setHistory([{ nodes: defaultPreset.nodes, connections: defaultPreset.connections }]);
    setHistoryIndex(0);
  }, []);

  // Sync to local storage
  const saveToLocalStorage = (currentNodes: WorkflowNode[], currentConnections: Connection[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      nodes: currentNodes,
      connections: currentConnections
    }));
  };

  // Trigger brief alert toast
  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Helper: Append action to Undo/Redo history
  const pushToHistory = (newNodes: WorkflowNode[], newConnections: Connection[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    setHistory([...nextHistory, { nodes: newNodes, connections: newConnections }]);
    setHistoryIndex(nextHistory.length);
    saveToLocalStorage(newNodes, newConnections);
  };

  // Undo triggers
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const state = history[prevIdx];
      setNodes(state.nodes);
      setConnections(state.connections);
      setHistoryIndex(prevIdx);
      saveToLocalStorage(state.nodes, state.connections);
      showToast('Undo performed Successfully', 'info');
    }
  };

  // Redo triggers
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const state = history[nextIdx];
      setNodes(state.nodes);
      setConnections(state.connections);
      setHistoryIndex(nextIdx);
      saveToLocalStorage(state.nodes, state.connections);
      showToast('Redo performed Successfully', 'info');
    }
  };

  // --- Node CRUD Event Handlers ---

  // Add standard node via Toolbar
  const handleAddNodeNearCenter = () => {
    const rx = Math.max(100, Math.floor(Math.random() * 200) + 200);
    const ry = Math.max(100, Math.floor(Math.random() * 150) + 150);
    handleAddNodeAtCoords(rx, ry);
  };

  // Add node at precise coordinate (e.g. from Double Click)
  const handleAddNodeAtCoords = (x: number, y: number) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      title: 'New Workflow Box',
      description: 'Custom microservice layers or priority tasks catalogued here.',
      x: x,
      y: y,
      color: 'blue',
      systemTag: 'New Tier',
      nodePriority: Priority.MEDIUM,
      levelItems: [
        { id: `item-1-${Date.now()}`, name: 'Action level 1', priority: Priority.MEDIUM, systemTag: 'TODO' }
      ]
    };

    const nextNodes = [...nodes, newNode];
    setNodes(nextNodes);
    setSelectedNodeId(newNode.id);
    pushToHistory(nextNodes, connections);
    showToast('Created new workflow box. Configure inside.', 'success');
  };

  // Update Node Fields
  const handleUpdateNode = (updatedNode: WorkflowNode, saveHistory: boolean = false) => {
    const nextNodes = nodes.map((n) => (n.id === updatedNode.id ? updatedNode : n));
    setNodes(nextNodes);
    
    // We update local storage instantly for dragging without polluting Undo history.
    // Deep changes (changing labels, adding levels) will trigger a pushToHistory separately.
    if (saveHistory) {
      pushToHistory(nextNodes, connections);
    } else {
      saveToLocalStorage(nextNodes, connections);
    }
  };

  // End drag or edit to commit state to Undo History
  const handleCommitNodeChange = () => {
    pushToHistory(nodes, connections);
  };

  // Delete node along with its connection lines
  const handleDeleteNode = (nodeId: string) => {
    const nextNodes = nodes.filter((n) => n.id !== nodeId);
    const nextConnections = connections.filter(
      (conn) => conn.fromNodeId !== nodeId && conn.toNodeId !== nodeId
    );

    setNodes(nextNodes);
    setConnections(nextConnections);
    
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }

    pushToHistory(nextNodes, nextConnections);
    showToast('Workflow box and links deleted', 'info');
  };

  // Clean wipe
  const handleClearAll = () => {
    setNodes([]);
    setConnections([]);
    setSelectedNodeId(null);
    pushToHistory([], []);
    showToast('Workflow canvas cleared', 'info');
  };

  // Load template presets
  const handleLoadPreset = (preset: WorkflowPreset) => {
    setNodes(preset.nodes);
    setConnections(preset.connections);
    setSelectedNodeId(null);
    setPanX(60);
    setPanY(50);
    setZoom(0.95);
    pushToHistory(preset.nodes, preset.connections);
    showToast(`Loaded "${preset.name}" workflow.`, 'success');
  };

  // --- Dynamic Connections Handlers ---

  const handleAddConnection = (fromNodeId: string, toNodeId: string, style: ConnectionStyle) => {
    // Prevent duplicate connection from-to
    const exists = connections.some(
      (conn) => conn.fromNodeId === fromNodeId && conn.toNodeId === toNodeId
    );

    if (exists) {
      showToast('A connection between these boxes already exists!', 'error');
      return;
    }

    const newConn: Connection = {
      id: `conn-${Date.now()}`,
      fromNodeId,
      toNodeId,
      label: 'Flow Action',
      style,
      isDashed: false
    };

    const nextConnections = [...connections, newConn];
    setConnections(nextConnections);
    pushToHistory(nodes, nextConnections);
    showToast('Arrow connection linked successfully', 'success');
  };

  const handleDeleteConnection = (connId: string) => {
    const nextConnections = connections.filter((c) => c.id !== connId);
    setConnections(nextConnections);
    pushToHistory(nodes, nextConnections);
    showToast('Connection path removed', 'info');
  };

  const handleUpdateConnectionLabel = (connId: string, label: string) => {
    const nextConnections = connections.map((c) =>
      c.id === connId ? { ...c, label } : c
    );
    setConnections(nextConnections);
    pushToHistory(nodes, nextConnections);
  };

  // --- Export and Import JSON ---

  const handleExportJSON = () => {
    const data: CanvasState = {
      nodes,
      connections,
      zoom,
      panX,
      panY
    };

    const jsonString = JSON.stringify(data, null, 2);
    
    // Copy to clipboard
    navigator.clipboard.writeText(jsonString)
      .then(() => {
        showToast('Workflow JSON copied to clipboard!', 'success');
      })
      .catch((err) => {
        console.error('Clipboard error', err);
        showToast('Failed to copy. Try manual download.', 'error');
      });
  };

  const handleImportJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.nodes)) {
        const validatedNodes: WorkflowNode[] = parsed.nodes.map((n: any, idx: number) => ({
          id: n.id || `node-imported-${idx}-${Date.now()}`,
          title: n.title || 'Untitled Node',
          description: n.description || '',
          x: typeof n.x === 'number' ? n.x : 100 + idx * 50,
          y: typeof n.y === 'number' ? n.y : 100 + idx * 40,
          color: n.color || 'blue',
          systemTag: n.systemTag || '',
          nodePriority: n.nodePriority || Priority.MEDIUM,
          levelItems: Array.isArray(n.levelItems) ? n.levelItems : []
        }));

        const validatedConnections: Connection[] = Array.isArray(parsed.connections)
          ? parsed.connections.map((c: any, idx: number) => ({
              id: c.id || `conn-imported-${idx}-${Date.now()}`,
              fromNodeId: c.fromNodeId,
              toNodeId: c.toNodeId,
              label: c.label || 'Action',
              style: c.style || ConnectionStyle.CURVE,
              isDashed: !!c.isDashed
            }))
          : [];

        setNodes(validatedNodes);
        setConnections(validatedConnections);
        setSelectedNodeId(null);
        pushToHistory(validatedNodes, validatedConnections);
        showToast('Successfully imported external workflow layout!', 'success');
        return true;
      }
    } catch (e) {
      console.error('Validation failed on JSON import', e);
    }
    return false;
  };

  // --- Zoom logic handlers ---
  const handleZoomIn = () => setZoom((z) => Math.min(1.8, z + 0.1));
  const handleZoomOut = () => setZoom((z) => Math.max(0.4, z - 0.1));
  const handleZoomReset = () => {
    setZoom(1.0);
    setPanX(50);
    setPanY(30);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans select-none overflow-hidden text-slate-800">
      {/* Dynamic Alert Banner */}
      {toastMessage && (
        <div id="app-toast-alert" className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold animate-in fade-in slide-in-from-top duration-300 bg-slate-900 border-slate-800 text-white">
          <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 scale-90 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Bar Toolbar Component */}
      <Toolbar
        onAddNode={handleAddNodeNearCenter}
        onClearAll={handleClearAll}
        onLoadPreset={handleLoadPreset}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterHighPriorityOnly={filterHighPriorityOnly}
        onFilterHighPriorityChange={setFilterHighPriorityOnly}
        defaultConnectionStyle={defaultConnectionStyle}
        onChangeDefaultConnectionStyle={setDefaultConnectionStyle}
        customSaves={customSaves}
        onSaveWorkflow={handleSaveWorkflow}
        onLoadCustomSave={handleLoadCustomSave}
        onDeleteCustomSave={handleDeleteCustomSave}
        showHelp={showHelp}
        onToggleHelp={() => setShowHelp(!showHelp)}
      />

      {/* Workspace Area Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Quick Command Control Floating Over Canvas */}
          <div className="absolute top-4 right-4 z-10 flex gap-1.5 items-center bg-white/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-200 shadow-sm">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo Action (Ctrl+Z)"
              className="p-1 px-2 hover:bg-slate-100 disabled:opacity-30 rounded text-slate-600 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
            <div className="w-px h-4 bg-slate-200" />
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo Action (Ctrl+Y)"
              className="p-1 px-2 hover:bg-slate-100 disabled:opacity-30 rounded text-slate-600 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono"
            >
              <Redo2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Redo</span>
            </button>
            <div className="w-px h-4 bg-slate-200" />
            <button
              onClick={() => setShowHelp(!showHelp)}
              title="Toggle Layout Help Guide"
              className={`p-1 hover:bg-slate-100 rounded text-slate-650 shrink-0 cursor-pointer ${
                showHelp ? 'bg-violet-50 text-violet-700' : ''
              }`}
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Flow Canvas */}
          <WorkflowCanvas
            nodes={nodes}
            connections={connections}
            zoom={zoom}
            panX={panX}
            panY={panY}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleDeleteNode}
            onAddNodeAtCoords={handleAddNodeAtCoords}
            onAddConnection={handleAddConnection}
            onDeleteConnection={handleDeleteConnection}
            onUpdateConnectionLabel={handleUpdateConnectionLabel}
            onUpdatePan={(x, y) => {
              setPanX(x);
              setPanY(y);
            }}
            searchTerm={searchTerm}
            filterHighPriority={filterHighPriorityOnly}
            defaultConnectionStyle={defaultConnectionStyle}
          />

          {/* Collapsible Float Help Overlay */}
          {showHelp && (
            <div className="absolute bottom-4 left-4 z-10">
              <HelpOverlay onClose={() => setShowHelp(false)} />
            </div>
          )}
        </div>

        {/* Selected Configurator Sidebar Tray */}
        {selectedNode && (
          <ActiveNodeEditor
            node={selectedNode}
            onUpdate={(val) => {
              handleUpdateNode(val, true);
            }}
            onDelete={() => handleDeleteNode(selectedNode.id)}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>
    </div>
  );
}

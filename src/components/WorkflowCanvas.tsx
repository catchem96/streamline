/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { WorkflowNode, Connection, Priority, ConnectionStyle } from '../types';
import { getColorClasses, getColorRaw } from '../presets';
import { 
  Move, 
  Trash2, 
  ArrowRight, 
  ChevronsRight, 
  Plus, 
  Settings, 
  Link2, 
  HelpCircle,
  Tag,
  AlertCircle,
  CheckCircle2,
  GitBranch,
  X,
  Type
} from 'lucide-react';

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  connections: Connection[];
  zoom: number;
  panX: number;
  panY: number;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onUpdateNode: (updatedNode: WorkflowNode) => void;
  onDeleteNode: (nodeId: string) => void;
  onAddNodeAtCoords: (x: number, y: number) => void;
  onAddConnection: (from: string, to: string, style: ConnectionStyle) => void;
  onDeleteConnection: (connId: string) => void;
  onUpdateConnectionLabel: (connId: string, label: string) => void;
  onUpdatePan: (panX: number, panY: number) => void;
  searchTerm: string;
  filterHighPriority: boolean;
  defaultConnectionStyle: ConnectionStyle;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  connections,
  zoom,
  panX,
  panY,
  selectedNodeId,
  onSelectNode,
  onUpdateNode,
  onDeleteNode,
  onAddNodeAtCoords,
  onAddConnection,
  onDeleteConnection,
  onUpdateConnectionLabel,
  onUpdatePan,
  searchTerm,
  filterHighPriority,
  defaultConnectionStyle
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Dragging nodes state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Panning background state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Connecting mode state
  const [linkingFromNodeId, setLinkingFromNodeId] = useState<string | null>(null);

  // Connection label editing state
  const [editingConnId, setEditingConnId] = useState<string | null>(null);
  const [editingConnLabel, setEditingConnLabel] = useState('');

  // Fixed Node visual dimensions
  const NODE_WIDTH = 260; // Estimated box width in px
  const NODE_HEIGHT = 160; // Estimated approximate box height in px

  // Double click handler on background to spawn box
  const handleBackgroundDoubleClick = (e: React.MouseEvent) => {
    if (e.target !== containerRef.current && e.target !== canvasRef.current) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Translate window click coordinates to zoom/pan adjusted coordinates
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const spawnX = (clientX - panX) / zoom - NODE_WIDTH / 2;
    const spawnY = (clientY - panY) / zoom - 40;

    onAddNodeAtCoords(Math.round(spawnX), Math.round(spawnY));
  };

  // Drag background to Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // If user clicked directly on container or the SVG grid background, we initiate panning
    if (e.target === containerRef.current || e.target === canvasRef.current || (e.target as SVGElement).id === 'grid-pattern-rect') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panX, y: e.clientY - panY });
      onSelectNode(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const newPanX = e.clientX - panStart.x;
      const newPanY = e.clientY - panStart.y;
      onUpdatePan(newPanX, newPanY);
    } else if (draggingNodeId) {
      // Dragging a node card
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      // Adjust with zoom/pan ratio
      const gridX = (clientX - panX) / zoom - dragOffset.x;
      const gridY = (clientY - panY) / zoom - dragOffset.y;

      const targetNode = nodes.find(n => n.id === draggingNodeId);
      if (targetNode) {
        onUpdateNode({
          ...targetNode,
          x: Math.round(gridX),
          y: Math.round(gridY)
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Node Drag handlers
  const handleNodeDragStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation(); // Avoid panning triggers
    if (linkingFromNodeId) return; // Prevent drag during target connection select

    onSelectNode(nodeId);

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Calculate mouse position relative to top left of node
    // Node position is in virtual coordinate space, so map mouse coordinates back to it
    const virtualMouseX = (clientX - panX) / zoom;
    const virtualMouseY = (clientY - panY) / zoom;

    setDragOffset({
      x: virtualMouseX - node.x,
      y: virtualMouseY - node.y
    });
    setDraggingNodeId(nodeId);
  };

  // Handles clicking a node in different scenarios
  const handleNodeClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (linkingFromNodeId) {
      if (linkingFromNodeId !== nodeId) {
        // Form link!
        onAddConnection(linkingFromNodeId, nodeId, defaultConnectionStyle);
      }
      setLinkingFromNodeId(null);
    } else {
      onSelectNode(nodeId);
    }
  };

  // Helper: Find boundary attachment point for connections (so arrows do not overlap/start from inside node)
  const getConnectionAttachmentPoints = (fromNode: WorkflowNode, toNode: WorkflowNode) => {
    // Basic approximate boundaries based on rendered node card size (260w, can vary based on items, let's use approx 260w x 180h)
    const w = 260;
    const h = 180;

    // Centroids
    const fromCenter = { x: fromNode.x + w / 2, y: fromNode.y + h / 2 };
    const toCenter = { x: toNode.x + w / 2, y: toNode.y + h / 2 };

    const dx = toCenter.x - fromCenter.x;
    const dy = toCenter.y - fromCenter.y;

    let fromX = fromCenter.x;
    let fromY = fromCenter.y;
    let toX = toCenter.x;
    let toY = toCenter.y;

    // Route dynamically using dominant direction
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal flow
      if (dx > 0) {
        // fromNode is on the left
        fromX = fromNode.x + w;
        toX = toNode.x;
      } else {
        // fromNode is on the right
        fromX = fromNode.x;
        toX = toNode.x + w;
      }
    } else {
      // Vertical flow
      if (dy > 0) {
        // fromNode is above
        fromY = fromNode.y + h;
        toY = toNode.y;
      } else {
        // fromNode is below
        fromY = fromNode.y;
        toY = toNode.y + h;
      }
    }

    return { fromX, fromY, toX, toY };
  };

  // Generate connection path strings
  const getPathString = (conn: Connection) => {
    const fromNode = nodes.find(n => n.id === conn.fromNodeId);
    const toNode = nodes.find(n => n.id === conn.toNodeId);

    if (!fromNode || !toNode) return '';

    const { fromX, fromY, toX, toY } = getConnectionAttachmentPoints(fromNode, toNode);

    if (conn.style === ConnectionStyle.STRAIGHT) {
      return `M ${fromX} ${fromY} L ${toX} ${toY}`;
    }

    if (conn.style === ConnectionStyle.ORTHOGONAL) {
      const midX = (fromX + toX) / 2;
      return `M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX} ${toY}`;
    }

    // Default: CURVE (Cubic Bezier)
    const dx = Math.abs(toX - fromX) * 0.5;
    const dy = Math.abs(toY - fromY) * 0.5;
    
    // Choose control point adjustment based on orientation
    const cpX1 = fromX + (toX > fromX ? dx : -dx);
    const cpY1 = fromY;
    const cpX2 = toX - (toX > fromX ? dx : -dx);
    const cpY2 = toY;

    return `M ${fromX} ${fromY} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${toX} ${toY}`;
  };

  // Quick edit connection label helper
  const handleEditConnLabel = (conn: Connection, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConnId(conn.id);
    setEditingConnLabel(conn.label || '');
  };

  const handleSaveConnLabel = (connId: string) => {
    onUpdateConnectionLabel(connId, editingConnLabel.trim());
    setEditingConnId(null);
  };

  return (
    <div
      id="workflow-canvas-container"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleBackgroundDoubleClick}
      className="flex-1 relative overflow-hidden bg-slate-50 select-none cursor-grab active:cursor-grabbing"
    >
      {/* Virtual Workspace Transform Layer */}
      <div
        id="workflow-render-grid"
        ref={canvasRef}
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
        className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none"
      >
        {/* SVG Connections & Dynamic Grid Backdrop */}
        <svg className="absolute inset-0 w-full h-full pointer-events-auto">
          <defs>
            {/* Grid Pattern definition */}
            <pattern id="canvas-grid-dots" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#cbd5e1" />
            </pattern>

            {/* Triangular Arrowhead Marker */}
            <marker
              id="arrowhead-marker"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
            </marker>
            <marker
              id="arrowhead-marker-active"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#8b5cf6" />
            </marker>
          </defs>

          {/* Large Grid Backdrop */}
          <rect id="grid-pattern-rect" width="100%" height="100%" fill="url(#canvas-grid-dots)" />

          {/* DRAWING CONNECTIONS */}
          {connections.map((conn) => {
            const pathStr = getPathString(conn);
            if (!pathStr) return null;

            // Highlight if connected to currently chosen node
            const isRelatedToSelection = selectedNodeId === conn.fromNodeId || selectedNodeId === conn.toNodeId;
            const strokeColor = isRelatedToSelection ? '#8b5cf6' : (conn.color || '#64748b');
            const strokeWidth = isRelatedToSelection ? 2.5 : 1.75;

            // Get middle path coordinate for labeling/deleting button
            const fromNode = nodes.find(n => n.id === conn.fromNodeId);
            const toNode = nodes.find(n => n.id === conn.toNodeId);
            let labelX = 0;
            let labelY = 0;

            if (fromNode && toNode) {
              const pts = getConnectionAttachmentPoints(fromNode, toNode);
              labelX = (pts.fromX + pts.toX) / 2;
              labelY = (pts.fromY + pts.toY) / 2;
            }

            return (
              <g key={conn.id} className="group">
                {/* Visual Glow Layer on hover */}
                <path
                  d={pathStr}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                  className="opacity-0 group-hover:opacity-60 cursor-pointer transition-opacity"
                />

                {/* Main Path */}
                <path
                  d={pathStr}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={conn.isDashed ? '5,5' : undefined}
                  markerEnd={isRelatedToSelection ? "url(#arrowhead-marker-active)" : "url(#arrowhead-marker)"}
                  className="transition-colors duration-150"
                />

                {/* Link label and delete widget */}
                {labelX > 0 && (
                  <foreignObject
                    x={labelX - 45}
                    y={labelY - 14}
                    width="90"
                    height="32"
                    className="overflow-visible"
                  >
                    <div className="flex items-center justify-center h-full gap-1">
                      {editingConnId === conn.id ? (
                        <div className="bg-white border border-violet-400 p-0.5 rounded shadow flex items-center gap-0.5 scale-95">
                          <input
                            type="text"
                            value={editingConnLabel}
                            onChange={(e) => setEditingConnLabel(e.target.value)}
                            onBlur={() => handleSaveConnLabel(conn.id)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveConnLabel(conn.id)}
                            className="w-16 text-[9px] px-1 py-0.2 outline-none font-sans text-slate-700 bg-white"
                            autoFocus
                            placeholder="flow text"
                          />
                          <button
                            type="button"
                            onMouseDown={() => handleSaveConnLabel(conn.id)}
                            className="bg-emerald-500 text-white rounded p-0.2 cursor-pointer"
                          >
                            <span className="text-[7px] px-0.5 font-bold">OK</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          {/* Label Text Pill */}
                          <button
                            onClick={(e) => handleEditConnLabel(conn, e)}
                            className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium border shadow-xs transition-transform hover:scale-105 cursor-pointer flex items-center gap-0.5 ${
                              isRelatedToSelection 
                                ? 'bg-violet-50 text-violet-700 border-violet-200' 
                                : 'bg-white text-slate-600 border-slate-200'
                            }`}
                          >
                            <Type className="w-2 h-2 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[65px]">{conn.label || 'Label'}</span>
                          </button>

                          {/* Quick delete arrow */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteConnection(conn.id);
                            }}
                            className="bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 p-0.5 rounded-full text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-xs cursor-pointer focus:opacity-100"
                            title="Remove connection"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>

        {/* NODES (BOXES) CONTAINER */}
        <div className="absolute inset-0 pointer-events-none">
          {nodes.map((node) => {
            const isSelected = node.id === selectedNodeId;
            const colorClasses = getColorClasses(node.color);

            // Filtering calculations
            const matchesSearch = searchTerm === '' || 
              node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              node.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (node.systemTag && node.systemTag.toLowerCase().includes(searchTerm.toLowerCase())) ||
              node.levelItems.some(it => it.name.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesPriority = !filterHighPriority || node.nodePriority === Priority.HIGH || node.levelItems.some(it => it.priority === Priority.HIGH);

            const isVisible = matchesSearch && matchesPriority;

            // Priority border color styling representation
            const priorityBorderOverride = 
              node.nodePriority === Priority.HIGH ? 'ring-2 ring-rose-500/70 border-rose-400' :
              node.nodePriority === Priority.MEDIUM ? 'ring-1 ring-amber-400/60 border-amber-300' : 'border-slate-200';

            return (
              <div
                key={node.id}
                id={`node-card-${node.id}`}
                style={{
                  position: 'absolute',
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: `${NODE_WIDTH}px`,
                }}
                onClick={(e) => handleNodeClick(e, node.id)}
                className={`pointer-events-auto rounded-xl bg-white shadow-md border hover:shadow-lg transition-all duration-150 flex flex-col group ${
                  isVisible ? 'opacity-100 scale-100' : 'opacity-20 scale-95 pointer-events-none saturate-50'
                } ${
                  isSelected ? 'ring-3 ring-violet-500/80 border-violet-500 shadow-xl' : priorityBorderOverride
                } ${
                  linkingFromNodeId && linkingFromNodeId !== node.id ? 'hover:scale-102 hover:ring-2 hover:ring-amber-500 cursor-copy' : ''
                }`}
              >
                {/* Node Drag Handle Header */}
                <div
                  onMouseDown={(e) => handleNodeDragStart(e, node.id)}
                  className={`p-2 rounded-t-xl flex items-center justify-between border-b cursor-move select-none ${colorClasses.bg} ${colorClasses.border}`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Move className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {node.systemTag ? (
                      <span className="text-[9px] font-bold font-mono tracking-wider uppercase px-1.5 py-0.5 rounded bg-white/70 text-slate-700 min-w-0 truncate">
                        {node.systemTag}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">Workflow Box</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Priority badge */}
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full font-mono ${
                      node.nodePriority === Priority.HIGH 
                        ? 'bg-rose-500 text-white' 
                        : node.nodePriority === Priority.MEDIUM
                        ? 'bg-amber-500 text-slate-900'
                        : 'bg-emerald-500 text-white'
                    }`}>
                      {node.nodePriority}
                    </span>
                  </div>
                </div>

                {/* Node Body Contained Content */}
                <div className="p-3.5 flex-1 flex flex-col gap-1.5">
                  <h3 className="font-bold text-slate-800 text-xs tracking-tight truncate leading-tight">
                    {node.title || 'Untitled Node'}
                  </h3>
                  <p className="text-[10.5px] text-slate-500 leading-normal line-clamp-2">
                    {node.description || 'Double click to configure details...'}
                  </p>

                  <div className="w-full h-px bg-slate-100 my-1" />

                  {/* Inside Levels (Checklists or system ranks) */}
                  <div className="space-y-1">
                    {node.levelItems.length === 0 ? (
                      <div className="text-[10px] text-slate-400 italic text-center py-1">
                        No nested priority items
                      </div>
                    ) : (
                      node.levelItems.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-1 text-[10px] text-slate-650"
                        >
                          <div className="flex items-center gap-1 min-w-0">
                            {item.completed ? (
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                            )}
                            <span className={`truncate ${item.completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                              {item.name}
                            </span>
                          </div>
                          
                          <span className={`text-[8px] px-1 rounded-sm font-mono tracking-tight shrink-0 ${
                            item.priority === Priority.HIGH ? 'bg-rose-50 text-rose-600' :
                            item.priority === Priority.MEDIUM ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                      ))
                    )}
                    {node.levelItems.length > 3 && (
                      <div className="text-[9px] text-violet-500 font-medium text-right pt-0.5">
                        + {node.levelItems.length - 3} more tiers
                      </div>
                    )}
                  </div>
                </div>

                {/* Action footer inside box */}
                <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 rounded-b-xl flex justify-between items-center text-[10px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNode(node.id);
                    }}
                    className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete box"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex gap-1.5">
                    {/* Add Connection Selector */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Turn linking on!
                        if (linkingFromNodeId === node.id) {
                          setLinkingFromNodeId(null);
                        } else {
                          setLinkingFromNodeId(node.id);
                          onSelectNode(node.id);
                        }
                      }}
                      className={`px-2 py-1 rounded font-medium flex items-center gap-1 transition-all cursor-pointer ${
                        linkingFromNodeId === node.id
                          ? 'bg-amber-500 text-slate-900 border border-amber-600 animate-pulse'
                          : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-650 hover:text-slate-800'
                      }`}
                      title={linkingFromNodeId === node.id ? "Click another node to link, or click here to cancel" : "Draw connection arrow from this Node"}
                    >
                      <Link2 className="w-3 h-3 text-violet-500 shrink-0" />
                      <span>{linkingFromNodeId === node.id ? 'Connecting...' : 'Connect'}</span>
                    </button>
                  </div>
                </div>

                {/* Connection Indicator overlay */}
                {linkingFromNodeId === node.id && (
                  <div className="absolute inset-0 bg-violet-600/10 border-2 border-violet-500 rounded-xl pointer-events-none flex items-center justify-center">
                    <span className="bg-slate-900/90 text-white font-mono text-[9px] px-2 py-0.5 rounded-full">
                      Link active
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Priority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO',
}

export interface CustomLevelItem {
  id: string;
  name: string;
  priority: Priority;
  systemTag?: string;
  completed?: boolean;
}

export interface WorkflowNode {
  id: string;
  title: string;
  description: string;
  x: number;
  y: number;
  color: string; // Tailwind tint configuration
  systemTag?: string; // Root system level (e.g. Frontend, DB, API)
  levelItems: CustomLevelItem[]; // Internal tasks or nested workflow tiers
  nodePriority: Priority; // Box priority
}

export enum ConnectionStyle {
  CURVE = 'CURVE',
  STRAIGHT = 'STRAIGHT',
  ORTHOGONAL = 'ORTHOGONAL',
}

export interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
  color?: string;
  style: ConnectionStyle;
  isDashed?: boolean;
}

export interface CanvasState {
  nodes: WorkflowNode[];
  connections: Connection[];
  zoom: number;
  panX: number;
  panY: number;
}

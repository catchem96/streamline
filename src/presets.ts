/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WorkflowNode, Connection, Priority, ConnectionStyle } from './types';

export interface WorkflowPreset {
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: Connection[];
}

export const WORKFLOW_PRESETS: WorkflowPreset[] = [
  {
    name: "E-Commerce Architecture",
    description: "Multi-tier modern infrastructure indicating priority layers and custom integrations.",
    nodes: [
      {
        id: "node-1",
        title: "Frontend Application",
        description: "Customer SPA built with React and Tailwind CSS",
        x: 80,
        y: 150,
        color: "blue",
        systemTag: "Client Tier",
        nodePriority: Priority.MEDIUM,
        levelItems: [
          { id: "item-1-1", name: "User Auth Portal", priority: Priority.HIGH, systemTag: "UI/UX", completed: true },
          { id: "item-1-2", name: "Product Grid & Search", priority: Priority.MEDIUM, systemTag: "Client UI", completed: true },
          { id: "item-1-3", name: "Stripe Shopping Cart", priority: Priority.HIGH, systemTag: "Checkout", completed: false }
        ]
      },
      {
        id: "node-2",
        title: "API Gateway & Server",
        description: "Node.js REST endpoint managing active routing and tokens",
        x: 480,
        y: 180,
        color: "violet",
        systemTag: "Core Server",
        nodePriority: Priority.HIGH,
        levelItems: [
          { id: "item-2-1", name: "JWT Auth Validate", priority: Priority.HIGH, systemTag: "Security", completed: true },
          { id: "item-2-2", name: "Inventory Database Sync", priority: Priority.MEDIUM, systemTag: "Core", completed: false },
          { id: "item-2-3", name: "Cache Middleware", priority: Priority.LOW, systemTag: "Speed", completed: true }
        ]
      },
      {
        id: "node-3",
        title: "Transaction Database",
        description: "PostgreSQL relational instances for orders & users",
        x: 840,
        y: 100,
        color: "emerald",
        systemTag: "Data Layer",
        nodePriority: Priority.HIGH,
        levelItems: [
          { id: "item-3-1", name: "Migrate orders table", priority: Priority.HIGH, systemTag: "SQL", completed: true },
          { id: "item-3-2", name: "Index transaction fields", priority: Priority.MEDIUM, systemTag: "Ops", completed: false }
        ]
      },
      {
        id: "node-4",
        title: "Stripe Payment Gateway",
        description: "Integration layer handling transactions in real-time",
        x: 840,
        y: 380,
        color: "amber",
        systemTag: "External API",
        nodePriority: Priority.MEDIUM,
        levelItems: [
          { id: "item-4-1", name: "Handle webhook failures", priority: Priority.HIGH, systemTag: "Finance", completed: false },
          { id: "item-4-2", name: "Sync refunds engine", priority: Priority.MEDIUM, systemTag: "Backend", completed: true }
        ]
      }
    ],
    connections: [
      {
        id: "conn-1-2",
        fromNodeId: "node-1",
        toNodeId: "node-2",
        label: "Secure API Request",
        color: "#6366f1",
        style: ConnectionStyle.CURVE,
        isDashed: false
      },
      {
        id: "conn-2-3",
        fromNodeId: "node-2",
        toNodeId: "node-3",
        label: "Write Order/User",
        color: "#10b981",
        style: ConnectionStyle.ORTHOGONAL,
        isDashed: false
      },
      {
        id: "conn-2-4",
        fromNodeId: "node-2",
        toNodeId: "node-4",
        label: "Process Charge",
        color: "#f59e0b",
        style: ConnectionStyle.STRAIGHT,
        isDashed: true
      }
    ]
  },
  {
    name: "SaaS Marketing Funnel",
    description: "Visual roadmap of customer journey levels and automation priority scores.",
    nodes: [
      {
        id: "funnel-1",
        title: "Ad Landings & Socials",
        description: "Top of funnel lead acquisition",
        x: 60,
        y: 120,
        color: "sky",
        systemTag: "Marketing",
        nodePriority: Priority.INFO,
        levelItems: [
          { id: "fi-1-1", name: "Google & Meta Ads Launch", priority: Priority.HIGH, systemTag: "Paid Ads", completed: true },
          { id: "fi-1-2", name: "Opt-In PDF Brochure Setup", priority: Priority.MEDIUM, systemTag: "Content", completed: true }
        ]
      },
      {
        id: "funnel-2",
        title: "E-mail Nurturing Sequence",
        description: "Automated sequence to build brand trust",
        x: 420,
        y: 120,
        color: "amber",
        systemTag: "Automation",
        nodePriority: Priority.MEDIUM,
        levelItems: [
          { id: "fi-2-1", name: "Day 1 Welcome E-mail", priority: Priority.HIGH, systemTag: "Inbound", completed: true },
          { id: "fi-2-2", name: "Day 3 Case Study Delivery", priority: Priority.MEDIUM, systemTag: "Sales", completed: false },
          { id: "fi-2-3", name: "Day 5 Video Walkthrough", priority: Priority.LOW, systemTag: "Sales", completed: false }
        ]
      },
      {
        id: "funnel-3",
        title: "Active Sales Call Portal",
        description: "Booking interface for high-value contracts",
        x: 770,
        y: 120,
        color: "rose",
        systemTag: "Sales Team",
        nodePriority: Priority.HIGH,
        levelItems: [
          { id: "fi-3-1", name: "Cal.com setup integration", priority: Priority.HIGH, systemTag: "Productivity", completed: true },
          { id: "fi-3-2", name: "Sales qualification script", priority: Priority.MEDIUM, systemTag: "Strategy", completed: true }
        ]
      }
    ],
    connections: [
      {
        id: "fc-1",
        fromNodeId: "funnel-1",
        toNodeId: "funnel-2",
        label: "Lead Captured",
        color: "#0284c7",
        style: ConnectionStyle.CURVE,
        isDashed: false
      },
      {
        id: "fc-2",
        fromNodeId: "funnel-2",
        toNodeId: "funnel-3",
        label: "Book Demo Event",
        color: "#e11d48",
        style: ConnectionStyle.CURVE,
        isDashed: false
      }
    ]
  },
  {
    name: "Incident Escalation Plan",
    description: "Standard operating procedural flow indicating support systems.",
    nodes: [
      {
        id: "inc-1",
        title: "Alert Trigger",
        description: "Datadog or Sentry error capture logs",
        x: 80,
        y: 200,
        color: "rose",
        systemTag: "Monitoring",
        nodePriority: Priority.HIGH,
        levelItems: [
          { id: "inci-1", name: "System Outage Severity 1", priority: Priority.HIGH, systemTag: "SRE", completed: true }
        ]
      },
      {
        id: "inc-2",
        title: "On-Call Rotations",
        description: "PagerDuty routing sequence active",
        x: 440,
        y: 100,
        color: "violet",
        systemTag: "Routing Engine",
        nodePriority: Priority.HIGH,
        levelItems: [
          { id: "inci-2", name: "Notify primary on-call SRE", priority: Priority.HIGH, systemTag: "Ops", completed: true },
          { id: "inci-3", name: "Acknowledge in Slack within 5m", priority: Priority.HIGH, systemTag: "Comms", completed: false }
        ]
      },
      {
        id: "inc-3",
        title: "Support Tier Escalation",
        description: "Manual ticket forwarding",
        x: 440,
        y: 350,
        color: "amber",
        systemTag: "Human Ops",
        nodePriority: Priority.MEDIUM,
        levelItems: [
          { id: "inci-4", name: "Formulate public status post", priority: Priority.MEDIUM, systemTag: "Comms", completed: false },
          { id: "inci-5", name: "Postmortem documentation", priority: Priority.LOW, systemTag: "Wiki", completed: false }
        ]
      }
    ],
    connections: [
      {
        id: "incc-1",
        fromNodeId: "inc-1",
        toNodeId: "inc-2",
        label: "Auto Escalated",
        color: "#e11d48",
        style: ConnectionStyle.CURVE,
        isDashed: false
      },
      {
        id: "incc-2",
        fromNodeId: "inc-1",
        toNodeId: "inc-3",
        label: "Manual fallback",
        color: "#f59e0b",
        style: ConnectionStyle.STRAIGHT,
        isDashed: true
      }
    ]
  }
];

export const COLORS = [
  { id: 'slate', bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-700', raw: '#64748b' },
  { id: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', raw: '#10b981' },
  { id: 'blue', bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', raw: '#3b82f6' },
  { id: 'sky', bg: 'bg-sky-50', border: 'border-sky-300', text: 'text-sky-700', raw: '#0ea5e9' },
  { id: 'amber', bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', raw: '#f59e0b' },
  { id: 'rose', bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700', raw: '#f43f5e' },
  { id: 'violet', bg: 'bg-violet-50', border: 'border-violet-300', text: 'text-violet-700', raw: '#8b5cf6' }
];

export function getColorRaw(colorId: string): string {
  const meta = COLORS.find(c => c.id === colorId);
  return meta ? meta.raw : '#475569';
}

export function getColorClasses(colorId: string): { bg: string; border: string; text: string } {
  const meta = COLORS.find(c => c.id === colorId);
  return meta ? { bg: meta.bg, border: meta.border, text: meta.text } : { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-800' };
}

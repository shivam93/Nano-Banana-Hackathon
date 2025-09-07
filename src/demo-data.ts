/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// This file contains mock data representing the core information
// extracted from the demo slide screenshots.

export const DEMO_DATA = {
  'roadmap.png': {
    tasks: [
      {
        taskName: "Launch Beta Program",
        owner: "Product Team",
        timeline: "Q1 2024",
        status: "Completed",
      },
      {
        taskName: "User Feedback Analysis",
        owner: "UX Research",
        timeline: "Q2 2024",
        status: "In Progress",
      },
      {
        taskName: "V2 Feature Planning",
        owner: "Product Team",
        timeline: "Q3 2024",
        status: "Not Started",
      },
      {
        taskName: "Public Launch Campaign",
        owner: "Marketing",
        timeline: "Q4 2024",
        status: "Not Started",
      },
    ],
  },
  'survey.png': {
    questions: [
      {
        questionText: "How satisfied are you with our product?",
        data: [
          { label: "Very Satisfied", value: 45 },
          { label: "Satisfied", value: 30 },
          { label: "Neutral", value: 15 },
          { label: "Unsatisfied", value: 10 },
        ],
      },
      {
        questionText: "Which feature is most important to you?",
        data: [
          { label: "Reporting", value: 55 },
          { label: "Integrations", value: 25 },
          { label: "UI/UX", value: 15 },
          { label: "Support", value: 5 },
        ],
      },
    ],
  },
  'flowchart.png': {
    nodes: [
      { id: 'start', label: 'User Submits Request' },
      { id: 'approval', label: 'Manager Approval?' },
      { id: 'process', label: 'Process Request' },
      { id: 'notify_approved', label: 'Notify User (Approved)' },
      { id: 'notify_denied', label: 'Notify User (Denied)' },
      { id: 'end', label: 'End' },
    ],
    edges: [
      { source: 'start', target: 'approval' },
      { source: 'approval', target: 'process' },
      { source: 'approval', target: 'notify_denied' },
      { source: 'process', target: 'notify_approved' },
      { source: 'notify_approved', target: 'end' },
      
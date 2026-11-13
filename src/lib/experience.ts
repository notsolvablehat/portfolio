export type Role = {
  company: string;
  role: string;
  start: string;
  end: string;
  current?: boolean;
  url?: string;
  /** Case study on this site, if the role produced one. */
  project?: string;
  points: string[];
  stack: string[];
};

export const EXPERIENCE: Role[] = [
  {
    company: "Yellow.ai",
    role: "Software Engineer Intern",
    start: "Aug 2026",
    end: "Now",
    current: true,
    url: "https://yellow.ai",
    points: [
      "47 merged pull requests across the agentic AI platform — its React web app and five backend services (insights, engagement, agents, analyze, document cognition).",
      "Redesigned core product surfaces: the Analytics overview, User 360, Functions v3, and the new Home with live relay metrics and streaming widget generation.",
      "Flow builder: sticky notes on the canvas, variable autocomplete in the Monaco API editor, and a fix that stopped the canvas freezing after every save.",
      "Shipped performance and reliability fixes — lazy-loaded charting, call-log recordings and transcripts, and role-gated settings.",
    ],
    stack: ["React", "TypeScript", "Monaco", "Microservices", "AI Agents"],
  },
  {
    company: "Albert Invent",
    role: "Software Engineer Intern",
    start: "Jan 2026",
    end: "Jul 2026",
    points: [
      "Published @yaseen-agha/testmu, an open-source npm CLI adopted by the Automation team that pulls TestMU test cases into coding agents (Claude Code, Codex) on Linux, macOS and Windows.",
      "Orchestrated Claude Code agents into an automation pipeline with custom lifecycle hooks — 194+ automated test cases, about 26% of the suite.",
      "Built a Power Automate flow that traces git blame on CircleCI failures and notifies the developer in Teams instantly, replacing manual failure tracking.",
    ],
    stack: ["Node.js", "npm", "Claude Code", "CircleCI", "Power Automate"],
  },
  {
    company: "Palette Design",
    role: "Full Stack Developer",
    start: "Jun 2025",
    end: "Dec 2025",
    project: "palette",
    points: [
      "Owned full-stack development of a multi-tenant AI design platform: led the TypeScript migration and frontend rewrite (React, Tailwind, React Flow) and built the FastAPI backend with RBAC, MongoDB, S3 uploads and Inngest jobs.",
      "Architected the AI generation pipeline (FastAPI, n8n, GPT-4o / Gemini) that streams multi-screen UI generations to the frontend in real time over SSE.",
      "Owned deployment end to end — containerised builds on Render with Docker, and cut infrastructure costs by migrating DynamoDB to MongoDB.",
    ],
    stack: ["React", "TypeScript", "FastAPI", "MongoDB", "n8n", "Docker"],
  },
  {
    company: "PathVision",
    role: "Algorithm Developer",
    start: "May 2025",
    end: "Jul 2025",
    points: [
      "Optimised a YOLOv3 pothole-detection pipeline on Raspberry Pi 5 for IDAS — about 8 FPS faster through multithreading, frame skipping and an FFmpeg pipeline.",
      "Raised detection accuracy from 85% to 93% by replacing a custom CNN with YOLOv3 for real-time embedded detection.",
      "Added geolocation tagging with geopy for structured, location-aware pothole records.",
    ],
    stack: ["Python", "YOLOv3", "OpenCV", "Raspberry Pi", "FFmpeg"],
  },
];

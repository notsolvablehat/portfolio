export type Stat = {
  /** The big figure. A single number in it counts up on reveal. */
  value: string;
  label: string;
  detail: string;
};

export type Role = {
  company: string;
  role: string;
  start: string;
  end: string;
  current?: boolean;
  url?: string;
  /** Case study on this site, if the role produced one. */
  project?: string;
  stats: Stat[];
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
    stats: [
      {
        value: "-91%",
        label: "Input lag in the flow builder",
        detail:
          "Worst keypress wait went from 1.45s to 130ms. Found a hidden 408-row variable tree re-rendering on every update, and cut React commits per save from up to 95 to 10.",
      },
      {
        value: "1.0s",
        label: "Faster page loads, app-wide",
        detail: "Lazy-loaded the charting library: about 500 KB less on every page, and 2.2s faster LCP on throttled CPUs.",
      },
      {
        value: "-84%",
        label: "Boot bundle — profiled & proposed",
        detail: "Traced the eager chunk from 5.7 MB to 0.9 MB by moving 90% of modules out of boot; first paint 4.9s → 3.2s. In review.",
      },
      {
        value: "3",
        label: "Major product redesigns shipped",
        detail:
          "User 360 (segments, a 4-step CSV import, SFTP sync), the Analytics overview, and an IDE-style Functions editor with Monaco, runs, environment diffs and conflict-safe saves.",
      },
    ],
    stack: ["React", "TypeScript", "Node.js", "Elasticsearch", "Monaco"],
  },
  {
    company: "Albert Invent",
    role: "Software Engineer Intern",
    start: "Jan 2026",
    end: "Jul 2026",
    stats: [
      {
        value: "194+",
        label: "Automated test cases",
        detail: "Orchestrated Claude Code agents with custom lifecycle hooks into a pipeline that wrote about 26% of the project's suite.",
      },
      {
        value: "npm",
        label: "Open-source CLI, adopted team-wide",
        detail: "@yaseen-agha/testmu pulls TestMU test cases into coding agents (Claude Code, Codex) on Linux, macOS and Windows.",
      },
      {
        value: "0",
        label: "Manual CI failure tracking",
        detail: "A Power Automate flow traces git blame on CircleCI failures and notifies the developer in Teams instantly.",
      },
    ],
    stack: ["Node.js", "Claude Code", "CircleCI", "Power Automate"],
  },
  {
    company: "Palette Design",
    role: "Full Stack Developer",
    start: "Jun 2025",
    end: "Dec 2025",
    project: "palette",
    stats: [
      {
        value: "0→1",
        label: "Owned the platform end to end",
        detail:
          "Led the TypeScript migration and React / React Flow rewrite of a multi-tenant AI design platform; built the FastAPI backend with RBAC, MongoDB, S3 and Inngest jobs.",
      },
      {
        value: "SSE",
        label: "Live multi-screen generation",
        detail: "Architected the AI pipeline (FastAPI, n8n, GPT-4o / Gemini) that streams generated UI screens to the frontend in real time.",
      },
      {
        value: "↓ Cost",
        label: "Leaner infrastructure",
        detail: "Containerised builds on Render with Docker, and cut infrastructure costs by migrating DynamoDB to MongoDB.",
      },
    ],
    stack: ["React", "TypeScript", "FastAPI", "MongoDB", "n8n", "Docker"],
  },
  {
    company: "PathVision",
    role: "Algorithm Developer",
    start: "May 2025",
    end: "Jul 2025",
    stats: [
      {
        value: "93%",
        label: "Detection accuracy, up from 85%",
        detail: "Replaced a custom CNN with YOLOv3 for real-time, embedded pothole detection.",
      },
      {
        value: "+8 FPS",
        label: "On a Raspberry Pi 5",
        detail: "Multithreading, frame skipping and an FFmpeg pipeline for the IDAS detection system.",
      },
    ],
    stack: ["Python", "YOLOv3", "OpenCV", "Raspberry Pi", "FFmpeg"],
  },
];

export type Img = { src: string; width: number; height: number };

export type Project = {
  slug: string;
  name: string;
  category: string;
  stack: string[];
  /** Live site, if public. */
  url?: string;
  /**
   * Mockup = a staged background with the site screenshot floated on it.
   * `screen.x / y / w` place the screenshot as fractions of the background
   * (left, top, width); its height follows the screenshot's aspect ratio.
   */
  mockup: { bg: Img; screen: Img & { x: number; y: number; w: number } };
  featured: boolean;
};

export const PROJECTS: Project[] = [
  {
    slug: "palette",
    name: "Palette",
    category: "AI SaaS — UX Research Platform",
    stack: ["React.js", "FastAPI", "MongoDB", "Flowise"],
    mockup: {
      bg: { src: "/images/palette_bg.png", width: 674, height: 367 },
      screen: { src: "/images/palette.png", width: 402, height: 219, x: 0.165, y: 0.198, w: 0.599 },
    },
    featured: true,
  },
  {
    slug: "lawyour",
    name: "Lawyour",
    category: "Legal Tech — Legal Assistance & Lawyer Discovery",
    stack: ["Next.js", "Express.js", "PostgreSQL"],
    mockup: {
      bg: { src: "/images/lawyour_bg.png", width: 547, height: 297 },
      screen: { src: "/images/lawyour.png", width: 321, height: 173, x: 0.083, y: 0.244, w: 0.591 },
    },
    featured: true,
  },
  {
    slug: "paisa",
    name: "paisa",
    category: "Fintech — Daily Safe-to-Spend Budgeting for India",
    stack: ["Next.js", "Vercel"],
    url: "https://paisa.mohammedyaseenagha.in/",
    mockup: {
      bg: { src: "/images/paisa_bg.webp", width: 1024, height: 572 },
      screen: { src: "/images/paisa.png", width: 3264, height: 1950, x: 0.2, y: 0.1, w: 0.6 },
    },
    featured: true,
  },
  {
    slug: "swasth-dekbhal",
    name: "Swasth Dekbhal",
    category: "Health Tech — AI-Powered Personal Health Management",
    stack: ["React.js", "FastAPI", "PostgreSQL", "MongoDB", "n8n"],
    mockup: {
      bg: { src: "/images/swasth_bg.png", width: 547, height: 297 },
      screen: { src: "/images/swasth_dekhbhal.png", width: 248, height: 173, x: 0.147, y: 0.236, w: 0.455 },
    },
    featured: false,
  },
];

export const FEATURED = PROJECTS.filter((p) => p.featured);
export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);

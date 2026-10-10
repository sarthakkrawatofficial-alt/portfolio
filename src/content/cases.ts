// Case studies shown on /case-studies and teased on the home page.
export type CaseStudy = {
  id: string;
  title: string;
  client: string;
  role: string;
  format: string;
  summary: string;
  context: string;
  made: string;
  how: string[];
  images: string[];
  youtubeId?: string;
};

export const CASES: CaseStudy[] = [
  {
    id: "testmu-agent-testing",
    title: "Agent testing explainer series",
    client: "TestMu AI · in-house",
    role: "Motion design · Edit",
    format: "2 long-form explainers + vertical shorts",
    summary: "A presenter-led series that explains how to test AI chatbots and voice agents, built to make TestMu AI known for agent testing.",
    context:
      "TestMu AI sells testing for AI agents, a category most QA teams are only now hearing about. The videos had to teach the topic first and let the product follow from it.",
    made:
      "Two long-form explainers, Chatbot Testing and Voice Agent Testing, each around seven minutes, plus vertical shorts on mobile and regression testing cut for Reels and Shorts.",
    how: [
      "Every chapter opens on a numbered card (\u201c09 Privacy & security testing\u201d), so a viewer who skips ahead always knows where they are.",
      "What the presenter says is shown as it is said: chat conversations, pass/fail checks and counters animate beside them instead of cutting away to stock footage.",
      "The shorts use a split layout, graphic on top and presenter below, so the point reads even with the sound off.",
    ],
    images: ["/img/cases/testmu-1.jpg", "/img/cases/testmu-2.jpg", "/img/cases/testmu-3.jpg"],
  },
  {
    id: "claude-cowork",
    title: "Claude Cowork concept film",
    client: "Interview assignment · TestMu AI",
    role: "Motion design · UI animation",
    format: "23-second product film",
    summary: "My interview assignment for TestMu AI: a short product film for Claude Cowork. A concept piece, not commissioned by Anthropic.",
    context:
      "The assignment was to show I could carry a SaaS product story with motion alone: no voiceover, no footage, 23 seconds.",
    made:
      "One request followed from start to finish. A message is typed, the work gets sorted into Research, Meetings, Files, Notes and Ideas, a presentation builds itself slide by slide, and the film ends on \u201cCompleted\u201d and the logo.",
    how: [
      "The interface is rebuilt from scratch in After Effects, so every element can move on its own instead of being a screen recording.",
      "One task carries the whole film, which makes it a story with an ending and not a list of features.",
      "The warm terracotta palette and serif wordmark follow Claude\u2019s own brand, so it reads as the product within the first second.",
    ],
    images: ["/img/cases/cowork-1.jpg", "/img/cases/cowork-2.jpg", "/img/cases/cowork-3.jpg"],
    youtubeId: "tK0afJ0TOBw",
  },
  {
    id: "workstatus",
    title: "Boost Productivity with Workstatus",
    client: "Workstatus · at Vinove",
    role: "Motion design · Edit",
    format: "90-second product explainer",
    summary: "A 90-second explainer for a workforce-analytics product, made while I was on Vinove\u2019s in-house team.",
    context:
      "Workstatus tracks time, activity and project health. On a pricing page that is a feature grid; the video had to make it feel like one product with one promise.",
    made:
      "A motion-only explainer that moves from the problem (unverified productivity) to the dashboards, and closes on \u201cmove faster and scale with confidence\u201d.",
    how: [
      "Kinetic type carries the argument, one short line at a time, so it works without a voiceover.",
      "A single dot runs through the film: it becomes a bar chart, an orbit of team members, then the product\u2019s dashboards. That gives the cuts something to follow.",
      "Real product screens are tilted and layered in 3D, and each one appears only when its line is on screen.",
    ],
    images: ["/img/cases/workstatus-1.jpg", "/img/cases/workstatus-2.jpg", "/img/cases/workstatus-3.jpg"],
    youtubeId: "gO1hzr2F0hM",
  },
];

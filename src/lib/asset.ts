// Prefix for files in /public when the site is served from a sub-path
// (GitHub Pages project sites live at /<repo>/).
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const asset = (p: string) => (p.startsWith("/") ? BASE_PATH + p : p);
